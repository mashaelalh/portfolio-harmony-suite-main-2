import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import MainLayout from '@/components/layout/MainLayout';
import AuthGuard from '@/components/auth/AuthGuard';
import { supabase } from '@/integrations/supabase/client'; // Use the shared client
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea'; // Remove Textarea import
import { RichTextEditor } from '@/components/ui/RichTextEditor'; // Import RichTextEditor
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useProjectStore, type ProjectStatus, type StageGate, type Project } from '@/lib/store/projectStore'; // Assuming Project type is updated here later
import { usePortfolioStore } from '@/lib/store/portfolioStore';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { CalendarIcon, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, isValid, parseISO } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { Skeleton } from "@/components/ui/skeleton";
// Removed local Supabase client initialization

// const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''; // Removed
// const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''; // Removed
// const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); // Removed local declaration

// Schema for individual deliverable (used for validation before submission)
const deliverableSchema = z.object({
  id: z.string(),
  description: z.string().min(1, { message: "Description is required." }),
  fromDate: z.date().nullable(),
  toDate: z.date().nullable(),
}).refine(data => !data.fromDate || !data.toDate || data.toDate >= data.fromDate, {
  message: "To Date cannot be earlier than From Date.",
  path: ["toDate"],
});

// Main project schema - removing deliverables from direct RHF control
const projectSchema = z.object({
  name: z.string().min(3, { message: "Project name must be at least 3 characters." }),
  projectCode: z.string().optional(),
  initiativeCode: z.string().optional(),
  phase: z.enum(['pre_initiation', 'initiation', 'planning', 'execution', 'closure'], { required_error: "Phase is required." }),
  description: z.string().optional(),
  portfolioId: z.string().uuid({ message: "Invalid Portfolio ID format." }).nullable().optional(),
  managerId: z.string().uuid({ message: "Invalid Manager ID format." }).nullable().optional(),
  owningDepartment: z.string().optional(),
  projectSponsor: z.string().min(1, { message: "Project Sponsor is required." }),
  projectOwner: z.string().min(1, { message: "Project Owner is required." }),
  strategicObjective: z.enum([
    'digital_transformation',
    'operational_excellence',
    'customer_experience',
    'innovation',
    'sustainability'
  ], { required_error: "Strategic Objective is required." }),
  corporateKPIs: z.array(z.string()).max(5, { message: "Maximum 5 KPIs allowed" }).optional(),
  // deliverables removed from RHF schema
  startDate: z.date({ required_error: "Start date is required." }),
  endDate: z.date({ required_error: "End date is required." }),
  status: z.enum(['not_started', 'in_progress', 'on_hold', 'completed', 'cancelled', 'on_track', 'delayed', 'at_risk'], { required_error: "Status is required." }),
  budget: z.number({ invalid_type_error: "Budget must be a number." }).nonnegative({ message: "Budget cannot be negative." }).default(0),
  actualCost: z.number({ invalid_type_error: "Actual cost must be a number." }).nonnegative({ message: "Actual cost cannot be negative." }).default(0),
  forecastedSpend: z.number({ invalid_type_error: "Forecast must be a number." }).nonnegative({ message: "Forecast cannot be negative." }).optional(),
}).refine(data => data.endDate >= data.startDate, {
  message: "End date cannot be earlier than start date.",
  path: ["endDate"],
});

type ProjectFormData = z.infer<typeof projectSchema>;

// Define the structure for the state-managed deliverables
type DeliverableEntry = {
  id: string; // Use string for UUID
  description: string;
  fromDate: Date | null;
  toDate: Date | null;
};

// Update payload type - assuming backend/store expects the *new* deliverable structure
// TODO: Update Project type and updateProject function in store to match this
type UpdatePayload = Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'stageGates' | 'milestones' | 'risks' | 'resources' | 'documents' | 'deliverables'>> & {
    projectCode?: string | null;
    phase?: 'pre_initiation' | 'initiation' | 'planning' | 'execution' | 'closure';
    portfolioId?: string | null;
    initiativeCode?: string | null;
    managerId?: string | null;
    owningDepartment?: string | null;
    projectSponsor?: string | null;
    projectOwner?: string | null;
    startDate?: string;
    endDate?: string;
    forecastedSpend?: number | null;
    strategicObjective?: 'digital_transformation' | 'operational_excellence' | 'customer_experience' | 'innovation' | 'sustainability';
    corporateKPIs?: string[];
    deliverables?: Array<{ // Using the new structure
      id: string; // ID is required for update payload items
      description: string;
      fromDate: string | null;
      toDate: string | null;
    }>;
};


const EditProject: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateProject, fetchProjectById, selectedProject } = useProjectStore();
  const { portfolios, fetchPortfolios } = usePortfolioStore();
  const [managers, setManagers] = useState<{ id: string; full_name: string }[]>([]);
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  // State for managing deliverables
  const [deliverablesState, setDeliverablesState] = useState<DeliverableEntry[]>([]); // Initialize empty

  // Setup React Hook Form
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      projectCode: '',
      initiativeCode: '',
      phase: 'planning',
      description: '',
      portfolioId: '',
      managerId: '',
      owningDepartment: '',
      projectSponsor: '',
      projectOwner: '',
      strategicObjective: 'digital_transformation',
      corporateKPIs: [],
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      status: 'not_started',
      budget: 0,
      actualCost: 0,
      forecastedSpend: 0,
    },
  });

  // --- Deliverable State Handlers ---
  const handleAddDeliverable = () => {
    setDeliverablesState([
      ...deliverablesState,
      { id: uuidv4(), description: '', fromDate: null, toDate: null }
    ]);
  };

  const handleRemoveDeliverable = (id: string) => {
    setDeliverablesState(deliverablesState.filter(d => d.id !== id));
  };

  const handleDeliverableChange = (id: string, field: keyof DeliverableEntry, value: string | Date | null) => {
    setDeliverablesState(
      deliverablesState.map(d =>
        d.id === id ? { ...d, [field]: value } : d
      )
    );
  };
  // --- End Deliverable State Handlers ---

  useEffect(() => {
    fetchPortfolios();
    // Fetch actual managers from Supabase
    const fetchManagers = async () => {
      toast.info("Fetching managers from Supabase...");
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, display_name')
          .eq('role', 'pm');
        if (error) throw error;
        if (data) {
          setManagers(
            data.filter(m => m.id && m.display_name)
              .map(m => ({ id: m.id, full_name: m.display_name }))
          );
        } else {
          setManagers([]);
        }
      } catch (error) {
        console.error('Error fetching managers:', error);
        toast.error('Failed to load project managers.');
        setManagers([]);
      }
    };
    fetchManagers();
  }, [fetchPortfolios]);

  useEffect(() => {
    if (id) {
      fetchProjectById(id);
    }
  }, [id, fetchProjectById]);

  useEffect(() => {
    if (selectedProject) {
      // Update form default values when selectedProject is loaded
      const projectData = selectedProject as Project; // Assuming Project type will be updated

      form.reset({
        name: projectData.name,
        projectCode: projectData.projectCode || '',
        initiativeCode: projectData.initiativeCode || '',
        phase: projectData.phase || 'planning',
        description: projectData.description || '',
        portfolioId: projectData.portfolioId || 'none', // Map null/undefined to 'none' for Select
        managerId: projectData.managerId || 'none',     // Map null/undefined to 'none' for Select
        owningDepartment: projectData.owningDepartment || '',
        projectSponsor: projectData.projectSponsor || '',
        projectOwner: projectData.projectOwner || '',
        strategicObjective: projectData.strategicObjective || 'digital_transformation',
        corporateKPIs: projectData.corporateKPIs || [],
        startDate: new Date(projectData.startDate),
        endDate: new Date(projectData.endDate),
        status: projectData.status,
        budget: projectData.budget,
        actualCost: projectData.actualCost,
        forecastedSpend: projectData.forecastedSpend ?? 0,
      });

      // --- Populate Deliverables State ---
      // Map existing deliverables (potentially old format) to the new state structure
      const initialDeliverables = Array.isArray(projectData.deliverables)
        ? projectData.deliverables.map((d: any) => ({ // Use 'any' temporarily
            id: d.id || uuidv4(), // Use existing ID or generate new one
            description: d.description || d.name || '', // Prioritize description, fallback to name
            // Parse dates carefully, handle null/invalid dates
            fromDate: d.fromDate && isValid(parseISO(d.fromDate)) ? parseISO(d.fromDate) : null,
            toDate: d.toDate && isValid(parseISO(d.toDate)) ? parseISO(d.toDate) : null,
          }))
        : [];
      setDeliverablesState(initialDeliverables);
      // --- End Populate Deliverables State ---
    }
  }, [selectedProject, form]);

  // Use RHF's handleSubmit
  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmittingManual(true);

    try {
      // --- Deliverable Validation (Manual) ---
      const validatedDeliverables = deliverablesState
        .map(d => deliverableSchema.safeParse(d))
        .filter(result => {
          if (!result.success) {
            const firstError = result.error.errors[0];
            toast.error(`Deliverable Error: ${firstError.path.join('.')} - ${firstError.message}`);
            return false;
          }
          return true;
        })
        .map(result => (result as z.SafeParseSuccess<DeliverableEntry>).data);

      if (validatedDeliverables.length !== deliverablesState.length) {
         toast.error("Please fix the errors in the deliverables section.");
         setIsSubmittingManual(false);
         return;
      }
      // --- End Deliverable Validation ---

      // Prepare payload using validated data and state
      const payload: UpdatePayload = {
        name: data.name,
        projectCode: data.projectCode || null,
        initiativeCode: data.initiativeCode || null,
        phase: data.phase,
        description: data.description ?? '',
        portfolioId: data.portfolioId === 'none' ? null : data.portfolioId,
        managerId: data.managerId === 'none' ? null : data.managerId,
        owningDepartment: data.owningDepartment || null,
        projectSponsor: data.projectSponsor || null,
        projectOwner: data.projectOwner || null,
        startDate: data.startDate.toISOString().split('T')[0],
        endDate: data.endDate.toISOString().split('T')[0],
        status: data.status,
        budget: data.budget,
        actualCost: data.actualCost,
        forecastedSpend: data.forecastedSpend ?? null,
        strategicObjective: data.strategicObjective,
        corporateKPIs: data.corporateKPIs,
        // Use validated and formatted deliverables from state (new structure)
        deliverables: validatedDeliverables.map(d => ({
          id: d.id, // Pass ID for potential updates
          description: d.description,
          fromDate: d.fromDate ? d.fromDate.toISOString().split('T')[0] : null,
          toDate: d.toDate ? d.toDate.toISOString().split('T')[0] : null,
        })),
      };

      if (id) {
        // TODO: Ensure updateProject in store handles the new deliverables structure
        await updateProject(id, payload);
        toast.success('Project updated successfully');
        navigate('/projects');
      } else {
        toast.error('Project ID is missing.');
      }
    } catch (error) {
      console.error('Error updating project in EditProject.tsx:', error);
      console.error('Error details:', error);
      toast.error('Failed to update project');
    } finally {
      setIsSubmittingManual(false);
    }
  };

  if (!selectedProject) {
    return (
      <AuthGuard>
        <MainLayout title="Edit Project">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8">
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <Skeleton className="h-24 w-full" />
                  <Separator />
                  <Skeleton className="h-10 w-1/3" />
                  <Skeleton className="h-40 w-full" />
                </CardContent>
              </Card>
            </div>
            <div className="col-span-12 lg:col-span-4">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </MainLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <MainLayout title="Edit Project">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Edit Project Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basic Information Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Project Name*</FormLabel> <FormControl><Input placeholder="Enter project name" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="portfolioId" render={({ field }) => ( <FormItem> <FormLabel>Portfolio</FormLabel> <Select onValueChange={field.onChange} value={field.value ?? 'none'} defaultValue="none"> <FormControl><SelectTrigger><SelectValue placeholder="Select portfolio" /></SelectTrigger></FormControl> <SelectContent> <SelectItem value="none">-- None --</SelectItem> {portfolios.map(p => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))} </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="projectCode" render={({ field }) => ( <FormItem> <FormLabel>Project Code</FormLabel> <FormControl><Input placeholder="e.g., PRJ-2025-003" {...field} value={field.value ?? ""} /></FormControl> <FormMessage /> </FormItem> )} />
                  </div>
                  <FormField control={form.control} name="initiativeCode" render={({ field }) => ( <FormItem> <FormLabel>Initiative Code</FormLabel> <FormControl><Input placeholder="e.g., PRJ-DEPT-001" {...field} value={field.value ?? ""} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="phase" render={({ field }) => ( <FormItem> <FormLabel>Phase*</FormLabel> <Select onValueChange={field.onChange} value={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select phase" /></SelectTrigger></FormControl> <SelectContent> <SelectItem value="pre_initiation">Pre-Initiation</SelectItem> <SelectItem value="initiation">Initiation</SelectItem> <SelectItem value="planning">Planning</SelectItem> <SelectItem value="execution">Execution</SelectItem> <SelectItem value="closure">Closure</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="managerId" render={({ field }) => ( <FormItem> <FormLabel>Project Manager</FormLabel> <Select onValueChange={field.onChange} value={field.value ?? 'none'} defaultValue="none"> <FormControl><SelectTrigger><SelectValue placeholder="Select project manager" /></SelectTrigger></FormControl> <SelectContent> <SelectItem value="none">-- None --</SelectItem> {managers.length === 0 ? <SelectItem value="loading" disabled>Loading...</SelectItem> : null} {managers.map(m => (<SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>))} </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="owningDepartment" render={({ field }) => ( <FormItem> <FormLabel>Owning Department</FormLabel> <FormControl><Input placeholder="e.g., CSR, Strategy, IT" {...field} value={field.value ?? ""} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Project Description</FormLabel> <FormControl><RichTextEditor placeholder="Describe the project objectives and scope..." value={field.value ?? ""} onChange={field.onChange} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="projectSponsor" render={({ field }) => ( <FormItem> <FormLabel>Project Sponsor*</FormLabel> <FormControl><Input placeholder="e.g., Tarik Khalifah" {...field} value={field.value ?? ""} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="projectOwner" render={({ field }) => ( <FormItem> <FormLabel>Project Owner*</FormLabel> <FormControl><Input placeholder="e.g., Reem Almeshari" {...field} value={field.value ?? ""} /></FormControl> <FormMessage /> </FormItem> )} />

                  {/* Timeline Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="startDate" render={({ field }) => ( <FormItem className="flex flex-col"> <FormLabel>Start Date*</FormLabel> <Popover> <PopoverTrigger asChild> <FormControl> <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}> {field.value ? format(field.value, "PPP") : <span>Pick a date</span>} <CalendarIcon className="ml-auto h-4 w-4 opacity-50" /> </Button> </FormControl> </PopoverTrigger> <PopoverContent className="w-auto p-0" align="start"> <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /> </PopoverContent> </Popover> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="endDate" render={({ field }) => ( <FormItem className="flex flex-col"> <FormLabel>End Date*</FormLabel> <Popover> <PopoverTrigger asChild> <FormControl> <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}> {field.value ? format(field.value, "PPP") : <span>Pick a date</span>} <CalendarIcon className="ml-auto h-4 w-4 opacity-50" /> </Button> </FormControl> </PopoverTrigger> <PopoverContent className="w-auto p-0" align="start"> <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /> </PopoverContent> </Popover> <FormMessage /> </FormItem> )} />
                  </div>

                  {/* Status & Financials Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField control={form.control} name="status" render={({ field }) => ( <FormItem> <FormLabel>Status</FormLabel> <Select onValueChange={field.onChange} value={field.value} defaultValue="not_started"> <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl> <SelectContent> <SelectItem value="not_started">Not Started</SelectItem> <SelectItem value="in_progress">In Progress</SelectItem> <SelectItem value="on_track">On Track</SelectItem> <SelectItem value="delayed">Delayed</SelectItem> <SelectItem value="at_risk">At Risk</SelectItem> <SelectItem value="on_hold">On Hold</SelectItem> <SelectItem value="completed">Completed</SelectItem> <SelectItem value="cancelled">Cancelled</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="budget" render={({ field }) => ( <FormItem> <FormLabel>Budget</FormLabel> <FormControl><Input type="number" placeholder="0.00" {...field} value={field.value ?? 0} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="actualCost" render={({ field }) => ( <FormItem> <FormLabel>Actual Cost</FormLabel> <FormControl><Input type="number" placeholder="0.00" {...field} value={field.value ?? 0} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="forecastedSpend" render={({ field }) => ( <FormItem> <FormLabel>Forecasted Spend</FormLabel> <FormControl><Input type="number" placeholder="0.00" {...field} value={field.value ?? 0} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl> <FormMessage /> </FormItem> )} />
                  </div>

                  {/* --- Dynamic Deliverables Section --- */}
                  <div className="col-span-1 md:col-span-2 space-y-4">
                    <FormLabel>Deliverables</FormLabel>
                    {deliverablesState.map((deliverable, index) => (
                      <Card key={deliverable.id} className="p-4 relative">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Description */}
                          <FormItem className="md:col-span-3">
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Deliverable description"
                                value={deliverable.description}
                                onChange={(e) => handleDeliverableChange(deliverable.id, 'description', e.target.value)}
                              />
                            </FormControl>
                            {deliverable.description === '' && <p className="text-sm text-destructive mt-1">Description is required.</p>}
                          </FormItem>

                          {/* From Date */}
                          <FormItem className="flex flex-col">
                            <FormLabel>From Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !deliverable.fromDate && "text-muted-foreground")}>
                                    {deliverable.fromDate ? format(deliverable.fromDate, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={deliverable.fromDate ?? undefined} onSelect={(date) => handleDeliverableChange(deliverable.id, 'fromDate', date ?? null)} initialFocus />
                              </PopoverContent>
                            </Popover>
                          </FormItem>

                          {/* To Date */}
                          <FormItem className="flex flex-col">
                            <FormLabel>To Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !deliverable.toDate && "text-muted-foreground")}>
                                    {deliverable.toDate ? format(deliverable.toDate, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={deliverable.toDate ?? undefined} onSelect={(date) => handleDeliverableChange(deliverable.id, 'toDate', date ?? null)} disabled={(date) => deliverable.fromDate ? date < deliverable.fromDate : false} initialFocus />
                              </PopoverContent>
                            </Popover>
                            {deliverable.fromDate && deliverable.toDate && deliverable.toDate < deliverable.fromDate && (<p className="text-sm text-destructive mt-1">To Date cannot be before From Date.</p>)}
                          </FormItem>

                          {/* Remove Button */}
                          <div className="flex items-end justify-end">
                            {deliverablesState.length > 0 && (
                              <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveDeliverable(deliverable.id)} className="h-9 w-9">
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Remove Deliverable</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                    <Button type="button" variant="outline" onClick={handleAddDeliverable} className="mt-2">
                      Add Deliverable
                    </Button>
                  </div>
                  {/* --- End Dynamic Deliverables Section --- */}

                  {/* Strategic Alignment Section */}
                  <div className="space-y-4 pt-6">
                    <h3 className="text-lg font-semibold">Strategic Alignment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="strategicObjective" render={({ field }) => ( <FormItem> <FormLabel>Strategic Objective*</FormLabel> <Select onValueChange={field.onChange} value={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select strategic objective" /></SelectTrigger></FormControl> <SelectContent> <SelectItem value="digital_transformation">Digital Transformation</SelectItem> <SelectItem value="operational_excellence">Operational Excellence</SelectItem> <SelectItem value="customer_experience">Customer Experience</SelectItem> <SelectItem value="innovation">Innovation</SelectItem> <SelectItem value="sustainability">Sustainability</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                      <FormField control={form.control} name="corporateKPIs" render={({ field }) => ( <FormItem> <FormLabel>Corporate KPIs</FormLabel> <FormControl> <Input placeholder="Enter KPIs (max 5)" value={field.value?.join(', ') ?? ''} onChange={(e) => { const kpis = e.target.value.split(',').map(kpi => kpi.trim()).filter(kpi => kpi); field.onChange(kpis.slice(0, 5)); }} /> </FormControl> <FormMessage /> </FormItem> )} />
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-end gap-4">
                    <Button variant="outline" type="button" onClick={() => navigate('/projects')} disabled={form.formState.isSubmitting || isSubmittingManual}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={form.formState.isSubmitting || isSubmittingManual}>
                      {form.formState.isSubmitting || isSubmittingManual ? (
                        <> <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> Updating... </>
                      ) : ( 'Update Project' )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </AuthGuard>
  );
};

export default EditProject;