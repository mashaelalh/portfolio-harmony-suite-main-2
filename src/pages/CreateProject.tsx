import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form'; // Import RHF
import { zodResolver } from '@hookform/resolvers/zod'; // Import Zod resolver
import * as z from 'zod'; // Import Zod
import MainLayout from '@/components/layout/MainLayout';
import AuthGuard from '@/components/auth/AuthGuard';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputFloatLabel } from '@/components/ui/input-float-label'; // Use named import
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/ui/file-upload'; // Updated to use named import
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox'; // Import Combobox
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'; // Import RHF-compatible Form components
import { useProjectStore, type ProjectStatus, type StageGate, type Project } from '@/lib/store/projectStore'; // Import Project type
import { usePortfolioStore } from '@/lib/store/portfolioStore';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { CalendarIcon, Trash2 } from 'lucide-react'; // Added Trash2
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, isValid, parseISO } from 'date-fns'; // Added isValid, parseISO
import { v4 as uuidv4 } from 'uuid'; // Added for unique IDs
// Define Zod Schema for validation
// Adjusted portfolioId and managerId to be required strings (can be empty)
// Schema for individual deliverable (used for validation before submission)
const deliverableSchema = z.object({
  id: z.string(), // Keep track of items in the UI state
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
  corporateKPIs: z.array(z.string()).max(5, { message: "Maximum 5 KPIs allowed" }),
  // deliverables: z.array(...) // Removed from RHF schema, will be handled by useState and validated separately
  startDate: z.date({ required_error: "Start date is required." }),
  endDate: z.date({ required_error: "End date is required." }),
  status: z.enum(['not_started', 'in_progress', 'on_hold', 'completed', 'cancelled', 'on_track', 'delayed', 'at_risk'], { required_error: "Status is required." }),
  budget: z.number({ invalid_type_error: "Budget must be a number." }).nonnegative({ message: "Budget cannot be negative." }).default(0),
  actualCost: z.number({ invalid_type_error: "Actual cost must be a number." }).nonnegative({ message: "Actual cost cannot be negative." }).default(0),
  forecastedSpend: z.number().optional(),
  projectFile: z.any().optional(), // Add optional projectFile field
}).refine(data => data.endDate >= data.startDate, {
  message: "End date cannot be earlier than start date.",
  path: ["endDate"],
});

type ProjectFormData = z.infer<typeof projectSchema>;

// Type for addProject payload (excluding generated fields)
// Define the structure for the state-managed deliverables
type DeliverableEntry = {
  id: string;
  description: string;
  fromDate: Date | null;
  toDate: Date | null;
};

// Update ProjectPayload for *creation* - deliverables won't have an ID yet.
type ProjectPayload = Omit<Project, 'id' | 'updatedAt' | 'deliverables'> & {
  deliverables: Array<{
    id?: string; // ID is optional for creation
    description: string;
    fromDate: string | null;
    toDate: string | null;
  }>;
};

// Define the structure for the state-managed deliverables (Removed duplicate)
// type DeliverableEntry = {
//   id: string;
//   description: string;
//   fromDate: Date | null;
//   toDate: Date | null;
// };


const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const { addProject } = useProjectStore();
  const { portfolios, fetchPortfolios } = usePortfolioStore();
  const [managers, setManagers] = useState<{ id: string; full_name: string }[]>([]);
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  // State for managing deliverables
  const [deliverablesState, setDeliverablesState] = useState<DeliverableEntry[]>([
    // Initialize with one empty deliverable
    { id: uuidv4(), description: '', fromDate: null, toDate: null }
  ]);

  // Setup React Hook Form
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      projectCode: '',
      initiativeCode: '',
      phase: 'planning',
      description: '',
      portfolioId: '', // Default to empty string
      managerId: '',   // Default to empty string
      owningDepartment: '',
      projectSponsor: '',
      projectOwner: '',
      strategicObjective: 'digital_transformation',
      corporateKPIs: [],
      // deliverables: [] // Removed from RHF default values
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)), // Default end date 3 months later
      status: 'not_started',
      budget: 0,
      actualCost: 0,
      forecastedSpend: 0,
    },
  });

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
          setManagers(data
            .filter(m => m.id && m.display_name)
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

  // Use RHF's handleSubmit
  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmittingManual(true);

    try {
      // --- File Upload to Supabase Storage ---
      let fileUrl: string | null = null;
      if (data.projectFile && data.projectFile[0]) {
        const file = data.projectFile[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `project_files/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('project_files')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          toast.error('Failed to upload project file.');
          setIsSubmittingManual(false);
          return;
        }

        if (uploadData) {
          fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/project_files/${filePath}`;
        }
      }
      // --- End File Upload ---

      // Create default stage gates
      const defaultStageGates: StageGate[] = [
        { stage: 'G0', status: 'not_started', notes: '', updatedAt: new Date().toISOString() },
        { stage: 'G1', status: 'not_started', notes: '', updatedAt: new Date().toISOString() },
        { stage: 'G2', status: 'not_started', notes: '', updatedAt: new Date().toISOString() },
        { stage: 'G3', status: 'not_started', notes: '', updatedAt: new Date().toISOString() },
        { stage: 'G4', status: 'not_started', notes: '', updatedAt: new Date().toISOString() },
      ];

      // --- Deliverable Validation (Manual) ---
      const validatedDeliverables = deliverablesState
        .map(d => deliverableSchema.safeParse(d))
        .filter(result => {
          if (!result.success) {
            // Aggregate errors or show toast for the first error
            const firstError = result.error.errors[0];
            toast.error(`Deliverable Error: ${firstError.path.join('.')} - ${firstError.message}`);
            return false;
          }
          return true;
        })
        .map(result => (result as z.SafeParseSuccess<DeliverableEntry>).data); // Extract data from successful results

      if (validatedDeliverables.length !== deliverablesState.length) {
         toast.error("Please fix the errors in the deliverables section.");
         setIsSubmittingManual(false);
         return; // Stop submission if validation fails
      }
      if (validatedDeliverables.length === 0) {
          toast.error("At least one deliverable is required.");
          setIsSubmittingManual(false);
          return; // Stop submission if no deliverables
      }
      // --- End Deliverable Validation ---


      // Format deliverables from state for the payload
      const formattedDeliverables = validatedDeliverables.map(d => ({
        // id: d.id, // Don't send client-generated ID for new records
        description: d.description,
        fromDate: d.fromDate ? d.fromDate.toISOString().split('T')[0] : null,
        toDate: d.toDate ? d.toDate.toISOString().split('T')[0] : null,
      }));


      const payload: ProjectPayload = {
        name: data.name,
        projectCode: data.projectCode || '',
        initiativeCode: data.initiativeCode || '',
        phase: data.phase,
        description: data.description ?? '',
        portfolioId: data.portfolioId === 'none' || !data.portfolioId ? null : data.portfolioId,
        managerId: data.managerId === 'none' || !data.managerId ? null : data.managerId,
        owningDepartment: data.owningDepartment || '',
        projectSponsor: data.projectSponsor || '',
        isDeleted: false,
        projectOwner: data.projectOwner || '',
        strategicObjective: data.strategicObjective,
        corporateKPIs: data.corporateKPIs,
        deliverables: formattedDeliverables, // Use correctly formatted state data
        startDate: data.startDate.toISOString().split('T')[0],
        endDate: data.endDate.toISOString().split('T')[0],
        status: data.status,
        budget: data.budget,
        actualCost: data.actualCost,
        forecastedSpend: data.forecastedSpend,
        stageGates: defaultStageGates,
        milestones: [],
        risks: [],
        resources: [],
        documents: [], // Documents are handled separately via uploadDocument, pass empty array initially
        created_at: new Date().toISOString(),
      };

      // addProject expects Omit<Project, 'id' | 'createdAt' | 'updatedAt'>, which payload matches
      await addProject(payload);

      toast.success('Project created successfully');
      navigate('/projects');
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    } finally {
      setIsSubmittingManual(false);
    }
  };

  return (
    <AuthGuard>
      <MainLayout title="Create New Project">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basic Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Project Name Field */}
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Name*</FormLabel>
                            <FormControl>
                              <InputFloatLabel label="Project Name*" placeholder="Enter project name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Project Code Field */}
                      <FormField
                        control={form.control}
                        name="projectCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Code</FormLabel>
                            <FormControl>
                              <InputFloatLabel label="Project Code" placeholder="e.g., PRJ-2025-003" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Portfolio Field */}
                      <FormField
                        control={form.control}
                        name="portfolioId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Portfolio</FormLabel>
                            <FormControl>
                              <Combobox
                                options={[
                                  { value: "none", label: "-- None --" },
                                  ...portfolios.map(p => ({ value: p.id, label: p.name }))
                                ]}
                                value={field.value ?? "none"}
                                onChange={(value) => field.onChange(value === "none" ? null : value)}
                                placeholder="Select portfolio..."
                                searchPlaceholder="Search portfolios..."
                                emptyPlaceholder="No portfolio found."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Initiative Code Field */}
                      <FormField
                        control={form.control}
                        name="initiativeCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Initiative Code</FormLabel>
                            <FormControl>
                              <InputFloatLabel label="Initiative Code" placeholder="e.g., 3.2" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Phase Field */}
                      <FormField
                        control={form.control}
                        name="phase"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phase*</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select phase" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="pre_initiation">Pre-Initiation</SelectItem>
                                <SelectItem value="initiation">Initiation</SelectItem>
                                <SelectItem value="planning">Planning</SelectItem>
                                <SelectItem value="execution">Execution</SelectItem>
                                <SelectItem value="closure">Closure</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Strategic Alignment Section */}
                  <div className="space-y-4 pt-6">
                    <h3 className="text-lg font-semibold">Strategic Alignment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Strategic Objective Field */}
                      <FormField
                        control={form.control}
                        name="strategicObjective"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Strategic Objective*</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select strategic objective" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="digital_transformation">Digital Transformation</SelectItem>
                                <SelectItem value="operational_excellence">Operational Excellence</SelectItem>
                                <SelectItem value="customer_experience">Customer Experience</SelectItem>
                                <SelectItem value="innovation">Innovation</SelectItem>
                                <SelectItem value="sustainability">Sustainability</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Corporate KPIs Field */}
                      <FormField
                        control={form.control}
                        name="corporateKPIs"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Corporate KPIs</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter KPIs (max 5)"
                                value={field.value.join(', ')}
                                onChange={(e) => {
                                  const kpis = e.target.value.split(',').map(kpi => kpi.trim()).filter(kpi => kpi);
                                  field.onChange(kpis.slice(0, 5)); // Limit to 5 KPIs
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                       {/* Owning Department Field */}
                       <FormField
                         control={form.control}
                         name="owningDepartment"
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel>Owning Department</FormLabel>
                             <FormControl>
                               <Input placeholder="e.g., CSR, Strategy, IT" {...field} />
                             </FormControl>
                             <FormMessage />
                           </FormItem>
                         )}
                       />

                      {/* Project Sponsor Field */}
                      <FormField
                        control={form.control}
                        name="projectSponsor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Sponsor*</FormLabel>
                            <FormControl>
                              <InputFloatLabel label="Project Sponsor*" placeholder="e.g., Tarik Khalifah" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Project Owner Field */}
                      <FormField
                        control={form.control}
                        name="projectOwner"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Owner*</FormLabel>
                            <FormControl>
                              <InputFloatLabel label="Project Owner*" placeholder="e.g., Reem Almeshari" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                      />

                      {/* Manager Field */}
                      <FormField
                        control={form.control}
                        name="managerId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Manager</FormLabel>
                            <FormControl>
                              <Combobox
                                options={[
                                  { value: "none", label: "-- None --" },
                                  ...managers.map(m => ({ value: m.id, label: m.full_name }))
                                ]}
                                value={field.value ?? "none"}
                                onChange={(value) => field.onChange(value === "none" ? null : value)}
                                placeholder="Select project manager..."
                                searchPlaceholder="Search managers..."
                                emptyPlaceholder={managers.length === 0 ? "Loading managers..." : "No manager found."}
                                disabled={managers.length === 0} // Disable while loading
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Project Description Section */}
                  <div className="space-y-4 pt-6">
                    {/* File Upload Field */}
                    <FormField
                      control={form.control}
                      name="projectFile" // Define a new field for the file
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Upload Project File</FormLabel>
                          <FormControl>
                            <FileUpload
                              label="Choose file"
                              onChange={(file) => {
                                field.onChange(file); // Update the field value with the file
                              }}
                              existingFileUrl={""} // Replace with logic to get existing file URL if editing
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Removed duplicate FileUpload field */}
                    <h3 className="text-lg font-semibold">Project Description</h3>
                    <div className="grid grid-cols-1 gap-6">
                      {/* Description Field */}
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Brief Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Summarize scope, outcome, and relevance"
                                rows={4}
                                {...field}
                                value={field.value ?? ""} // Handle potential undefined value
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* --- New Dynamic Deliverables Section --- */}
                      <div className="col-span-1 md:col-span-2 space-y-4"> {/* Span across columns */}
                        <FormLabel>Deliverables*</FormLabel>
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
                                {/* Basic validation message placeholder */}
                                {deliverable.description === '' && <p className="text-sm text-destructive mt-1">Description is required.</p>}
                              </FormItem>

                              {/* From Date */}
                              <FormItem className="flex flex-col">
                                <FormLabel>From Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "w-full pl-3 text-left font-normal",
                                          !deliverable.fromDate && "text-muted-foreground"
                                        )}
                                      >
                                        {deliverable.fromDate ? (
                                          format(deliverable.fromDate, "PPP")
                                        ) : (
                                          <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={deliverable.fromDate ?? undefined}
                                      onSelect={(date) => handleDeliverableChange(deliverable.id, 'fromDate', date ?? null)}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              </FormItem>

                              {/* To Date */}
                              <FormItem className="flex flex-col">
                                <FormLabel>To Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "w-full pl-3 text-left font-normal",
                                          !deliverable.toDate && "text-muted-foreground"
                                        )}
                                      >
                                        {deliverable.toDate ? (
                                          format(deliverable.toDate, "PPP")
                                        ) : (
                                          <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={deliverable.toDate ?? undefined}
                                      onSelect={(date) => handleDeliverableChange(deliverable.id, 'toDate', date ?? null)}
                                      disabled={(date) => // Disable dates before fromDate
                                        deliverable.fromDate ? date < deliverable.fromDate : false
                                      }
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                {/* Basic validation message placeholder */}
                                {deliverable.fromDate && deliverable.toDate && deliverable.toDate < deliverable.fromDate && (
                                    <p className="text-sm text-destructive mt-1">To Date cannot be before From Date.</p>
                                )}
                              </FormItem>

                              {/* Remove Button */}
                              <div className="flex items-end justify-end">
                                {deliverablesState.length > 1 && ( // Only show remove if more than one deliverable
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => handleRemoveDeliverable(deliverable.id)}
                                    className="h-9 w-9" // Adjust size to match date picker button
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Remove Deliverable</span>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddDeliverable}
                          className="mt-2"
                        >
                          Add Deliverable
                        </Button>
                      </div>
                      {/* --- End Dynamic Deliverables Section --- */}
                    </div>
                  </div>

                  {/* Timeline Section */}
                  <div className="space-y-4 pt-6">
                    <h3 className="text-lg font-semibold">Timeline</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Start Date Field */}
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Start Date*</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* End Date Field */}
                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>End Date*</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Status & Financials Section */}
                  <div className="space-y-4 pt-6">
                    <h3 className="text-lg font-semibold">Status & Financials</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Status Field */}
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} defaultValue="not_started">
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="not_started">Not Started</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="on_track">On Track</SelectItem>
                                <SelectItem value="delayed">Delayed</SelectItem>
                                <SelectItem value="at_risk">At Risk</SelectItem>
                                <SelectItem value="on_hold">On Hold</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Budget Field */}
                      <FormField
                        control={form.control}
                        name="budget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Approved Budget (SAR)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0.00" {...field} value={field.value ?? 0} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Actual Cost Field */}
                      <FormField
                        control={form.control}
                        name="actualCost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Actual Cost (SAR)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0.00" {...field} value={field.value ?? 0} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-end gap-4">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => navigate('/projects')}
                      disabled={form.formState.isSubmitting || isSubmittingManual} // Disable cancel during submission
                    >
                      Cancel
                    </Button>
                    {/* Use form.formState.isSubmitting combined with manual state */}
                    <Button type="submit" disabled={form.formState.isSubmitting || isSubmittingManual}>
                      {form.formState.isSubmitting || isSubmittingManual ? (
                        <>
                          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                          Creating...
                        </>
                      ) : (
                        'Create Project'
                      )}
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

export default CreateProject;
