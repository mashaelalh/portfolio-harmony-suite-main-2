import { create } from 'zustand';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid'; // Added import

// Validation Schemas
const StageGateUpdateSchema = z.object({
  status: z.enum(['not_started', 'in_progress', 'completed', 'blocked']).optional(),
  notes: z.string().min(20, "Rationale must be at least 20 characters").optional(),
  // Add fields based on feedback - assuming these are added to the DB schema
  rationale: z.string().min(20, "Rationale must be at least 20 characters").optional(),
  approvalStatus: z.enum(['pending', 'approved', 'rejected']).optional(),
  nextSteps: z.string().min(10, "Next steps must be defined").optional(),
  // prerequisites: z.array(z.string()).optional(), // For checking completion logic
  // ownerId: z.string().uuid().optional(), // For approval logic
  // dueDate: z.string().datetime().optional() // For date consistency checks
});
// Define a more complete schema for validation if needed elsewhere
const FullStageGateSchema = StageGateUpdateSchema.extend({
   stage: z.enum(['G0', 'G1', 'G2', 'G3', 'G4']),
   updatedAt: z.string().datetime()
   // Add non-optional fields from DB if creating new gates
});

// Allowed MIME types for upload
const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'image/png',
  'image/jpeg',
  'image/gif',
  // Add other allowed types here
] as const; // Use 'as const' for stricter typing in the enum

const ProjectDocumentSchema = z.object({
  id: z.string().uuid(), // Assuming DB generates UUID
  projectId: z.string().uuid(),
  fileName: z.string().min(3, "File name must be at least 3 characters"),
  filePath: z.string().min(1),
  fileType: z.enum(ALLOWED_DOC_TYPES, { errorMap: () => ({ message: "Invalid or unsupported file type." }) }),
  fileSize: z.number().positive("File size must be positive"),
  owner: z.string().min(2, "Owner must be assigned"), // Placeholder, AD integration needed
  tags: z.array(z.string()).default([]), // Add tags array, default to empty
  uploadedAt: z.string().datetime(),
});

// Schema for the data going *into* the insert function (before DB generates ID/timestamps)
const DocumentInsertSchema = ProjectDocumentSchema.omit({ id: true, uploadedAt: true, projectId: true });

export type ProjectStatus = 'not_started' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled' | 'on_track' | 'delayed' | 'at_risk';
export type ProjectPhase = 'pre_initiation' | 'initiation' | 'planning' | 'execution' | 'closure';
export type StageGateStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked';
export type RiskLevel = 'low' | 'medium' | 'high';
export type RiskStatus = 'open' | 'mitigated' | 'closed';
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'delayed';

export interface StageGate {
  stage: 'G0' | 'G1' | 'G2' | 'G3' | 'G4';
  status: StageGateStatus;
  notes: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  name: string;
  dueDate: string;
  status: MilestoneStatus;
}

export interface Risk {
  id: string;
  description: string;
  impact: RiskLevel;
  status: RiskStatus;
  mitigation?: string;
}

export interface Resource {
  id: string;
  userId: string;
  name: string;
  role: string;
}

export interface Document {
  id: string;
  projectId: string;
  fileName: string;
  filePath: string; // Path in Supabase Storage
  fileSize: number;
  fileType: typeof ALLOWED_DOC_TYPES[number]; // Use the stricter type
  owner: string; // Make owner mandatory based on schema
  tags: string[]; // Add tags array
  uploadedAt: string;
  url?: string; // Optional URL property for document access
}
// Define the new Deliverable structure for the Project interface
export interface Deliverable {
  id: string; // Keep track of items
  description: string;
  fromDate: string | null; // Store as ISO string or null
  toDate: string | null;   // Store as ISO string or null
}

export interface Project {
  id: string;
  portfolioId: string;
  name: string;
  description: string;
  projectCode?: string;
  initiativeCode?: string;
  phase?: ProjectPhase;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  budget: number;
  actualCost: number;
  forecastedSpend?: number;
  managerId: string;
  owningDepartment?: string;
  projectSponsor?: string;
  projectOwner?: string;
  ownerEmail?: string;
  sponsorEmail?: string;
  managerEmail?: string;
  strategicObjective?: 'digital_transformation' | 'operational_excellence' | 'customer_experience' | 'innovation' | 'sustainability';
  corporateKPIs?: string[];
  deliverables?: Deliverable[]; // Updated type
  stageGates: StageGate[];
  milestones: Milestone[];
  risks: Risk[];
  resources: Resource[];
  documents: Document[];
  created_at: string;
  updatedAt: string;

  // Soft Delete Fields
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string;
  restorationEligibleUntil?: string;
}

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean; // For fetching project data
  isUploadingDocument: boolean; // Specific state for document upload
  error: string | null;
  fetchProjects: (options?: { includeDeleted?: boolean }) => Promise<void>;
  fetchProjectById: (id: string, options?: { includeDeleted?: boolean }) => Promise<void>;
  // Modify addProject to accept deliverables without IDs for creation
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted' | 'deletedAt' | 'deletedBy' | 'restorationEligibleUntil' | 'deliverables'> & { deliverables?: Array<Omit<Deliverable, 'id'>> }) => Promise<void>;
  updateProject: (id: string, data: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted' | 'deletedAt' | 'deletedBy' | 'restorationEligibleUntil'>>) => Promise<void>;
  deleteProject: (id: string, options?: Record<string, any>) => Promise<void>;
  restoreProject: (id: string) => Promise<void>;
  addRisk: (projectId: string, risk: Omit<Risk, 'id'>) => Promise<void>;
  updateRisk: (projectId: string, riskId: string, data: Partial<Risk>) => Promise<void>;
  addMilestone: (projectId: string, milestone: Omit<Milestone, 'id'>) => Promise<void>;
  updateMilestone: (projectId: string, milestoneId: string, data: Partial<Milestone>) => Promise<void>;
  updateStageGate: (projectId: string, stage: StageGate['stage'], data: Partial<StageGate>) => Promise<void>;
  addResource: (projectId: string, resource: Omit<Resource, 'id' | 'userId'>) => Promise<void>; // Add userId later if needed
  // Document Actions
  fetchDocuments: (projectId: string) => Promise<void>;
  uploadDocument: (projectId: string, file: File) => Promise<void>;
  // deleteDocument: (documentId: string) => Promise<void>; // Add later if needed
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  selectedProject: null,
  isLoading: false,
  isUploadingDocument: false, // Initialize new state
  error: null,
  fetchProjects: async (options = { includeDeleted: false }) => {
    set({ isLoading: true, error: null });
    try {
      let query = supabase.from('projects').select('*');
      
      // Gracefully handle missing soft delete column
      try {
        if (!options.includeDeleted) {
          query = query.eq('is_deleted', false);
        }
      } catch (columnError) {
        console.warn('Soft delete column "is_deleted" not found. Fetching all projects.', columnError);
        // If column doesn't exist, proceed without filtering
      }
      
      const { data: projects, error: projectsError } = await query;
      console.log("Fetched projects:", projects);
      
      if (projectsError) throw projectsError;
      
      const fullProjects = await Promise.all(projects.map(async (project) => {
        const { data: stageGates, error: stageGatesError } = await supabase
          .from('stage_gates')
          .select('*')
          .eq('project_id', project.id)
          .order('stage');
        
        if (stageGatesError) throw stageGatesError;
        
        const { data: milestones, error: milestonesError } = await supabase
          .from('milestones')
          .select('*')
          .eq('project_id', project.id);
        
        if (milestonesError) throw milestonesError;
        
        const { data: risks, error: risksError } = await supabase
          .from('risks')
          .select('*')
          .eq('project_id', project.id);
        
        if (risksError) throw risksError;
        
        const { data: resources, error: resourcesError } = await supabase
          .from('resources')
          .select('*')
          .eq('project_id', project.id);
        
        if (resourcesError) throw resourcesError;
        
        return {
          id: project.id,
          portfolioId: project.portfolio_id,
          name: project.name,
          description: project.description || '',
          projectCode: (project as any).project_code || '',
          initiativeCode: (project as any).initiative_code || '',
          phase: (project as any).phase as ProjectPhase || undefined,
          startDate: project.start_date,
          endDate: project.end_date,
          status: project.status as ProjectStatus,
          budget: Number(project.budget),
          actualCost: Number(project.actual_cost),
          forecastedSpend: Number((project as any).forecasted_spend || 0),
          managerId: project.manager_id || '',
          owningDepartment: (project as any).owning_department || '',
          projectSponsor: (project as any).project_sponsor || '',
          projectOwner: (project as any).project_owner || '',
          strategicObjective: (project as any).strategic_objective,
          corporateKPIs: (project as any).corporate_kpis || [],
          // Map deliverables from DB (assuming new structure)
          deliverables: Array.isArray(project.deliverables)
            ? project.deliverables.map((d: any) => ({
                id: d.id || uuidv4(), // Ensure ID exists
                description: d.description || '',
                fromDate: d.fromDate || null,
                toDate: d.toDate || null,
              }))
            : [],
          stageGates: stageGates.map((sg) => ({
            stage: sg.stage as 'G0' | 'G1' | 'G2' | 'G3' | 'G4',
            status: sg.status as StageGateStatus,
            notes: sg.notes || '',
            updatedAt: sg.updated_at
          })),
          milestones: milestones.map((m) => ({
            id: m.id,
            name: m.name,
            dueDate: m.due_date,
            status: m.status as MilestoneStatus
          })),
          risks: risks.map((r) => ({
            id: r.id,
            description: r.description,
            impact: r.impact as RiskLevel,
            status: r.status as RiskStatus,
            mitigation: r.mitigation
          })),
          resources: resources.map((r) => ({
            id: r.id,
            userId: r.user_id || '',
            name: r.name,
            role: r.role
          })),
          createdAt: project.created_at,
          updatedAt: project.updated_at,
          documents: [], // Initialize documents array
          
          // Soft delete fields with safe fallback and type conversion
          isDeleted: project.is_deleted || false,
          deletedAt: project.deleted_at || undefined,
          deletedBy: project.deleted_by || undefined,
          restorationEligibleUntil: project.restoration_eligible_until || undefined
        };
      }));

      // Type assertion needed because the mapping might not satisfy Project[] immediately if documents aren't fetched here
      set({ projects: fullProjects as unknown as Project[], isLoading: false });
    } catch (error) {
      console.error('Error fetching projects:', error);
      set({
        error: `Failed to load projects: ${(error as Error).message}.
        This may be due to missing soft delete columns in the database schema.
        Please run a database migration to add 'is_deleted', 'deleted_at', 'deleted_by', and 'restoration_eligible_until' columns to the 'projects' table.`,
        isLoading: false
      });
      toast.error('Database schema issue. Check console for details.');
    }
  },
  fetchProjectById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Fetch project data
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (projectError) {
        console.error('Error fetching project details:', projectError);
        throw new Error(`Failed to load project: ${projectError.message}`);
      }
      
      if (!project) {
        throw new Error('Project not found or you don\'t have access');
      }

      // Fetch related data in parallel
      const [stageGatesResult, milestonesResult, risksResult, resourcesResult, documentsResult] = await Promise.all([
        supabase.from('stage_gates').select('*').eq('project_id', id).order('stage'),
        supabase.from('milestones').select('*').eq('project_id', id),
        supabase.from('risks').select('*').eq('project_id', id),
        supabase.from('resources').select('*').eq('project_id', id),
        supabase.from('documents').select('*').eq('project_id', id)
      ]);

      // Check for errors
      if (stageGatesResult.error) throw new Error(`Failed to load stage gates: ${stageGatesResult.error.message}`);
      if (milestonesResult.error) throw new Error(`Failed to load milestones: ${milestonesResult.error.message}`);
      if (risksResult.error) throw new Error(`Failed to load risks: ${risksResult.error.message}`);
      if (resourcesResult.error) throw new Error(`Failed to load resources: ${resourcesResult.error.message}`);
      if (documentsResult.error) throw new Error(`Failed to load documents: ${documentsResult.error.message}`);

      const fullProject: Project = {
        id: project.id,
        portfolioId: project.portfolio_id,
        name: project.name,
        description: project.description || '',
        projectCode: project.project_code || '',
        initiativeCode: project.initiative_code || '',
        phase: project.phase as ProjectPhase || undefined,
        startDate: project.start_date,
        endDate: project.end_date,
        status: project.status as ProjectStatus,
        budget: Number(project.budget),
        actualCost: Number(project.actual_cost),
        forecastedSpend: Number(project.forecasted_spend || 0),
        managerId: project.manager_id || '',
        owningDepartment: project.owning_department || '',
        projectSponsor: project.project_sponsor || '',
        projectOwner: project.project_owner || '',
        strategicObjective: project.strategic_objective,
        corporateKPIs: project.corporate_kpis || [],
        deliverables: Array.isArray(project.deliverables)
          ? project.deliverables.map((d: any) => ({
              id: d.id || uuidv4(),
              description: d.description || '',
              fromDate: d.fromDate || null,
              toDate: d.toDate || null,
            }))
          : [],
        stageGates: (stageGatesResult.data || []).map((sg) => ({
          stage: sg.stage as 'G0' | 'G1' | 'G2' | 'G3' | 'G4',
          status: sg.status as StageGateStatus,
          notes: sg.notes || '',
          updatedAt: sg.updated_at
        })),
        milestones: (milestonesResult.data || []).map((m) => ({
          id: m.id,
          name: m.name,
          dueDate: m.due_date,
          status: m.status as MilestoneStatus
        })),
        risks: (risksResult.data || []).map((r) => ({
          id: r.id,
          description: r.description,
          impact: r.impact as RiskLevel,
          status: r.status as RiskStatus,
          mitigation: r.mitigation
        })),
        resources: (resourcesResult.data || []).map((r) => ({
          id: r.id,
          userId: r.user_id || '',
          name: r.name,
          role: r.role
        })),
        documents: (documentsResult.data || []).map((doc) => {
          const fileType = ALLOWED_DOC_TYPES.includes(doc.file_type as any) ? doc.file_type : null;
          if (!fileType) {
            console.warn(`Skipping document with unsupported file type '${doc.file_type}':`, doc);
            return null;
          }
          return {
            id: doc.id,
            projectId: doc.project_id,
            fileName: doc.file_name,
            filePath: doc.file_path,
            fileSize: doc.file_size,
            fileType: fileType,
            owner: doc.owner || 'Unknown Owner',
            tags: Array.isArray(doc.tags) ? doc.tags : [],
            uploadedAt: doc.uploaded_at,
          };
        }).filter((doc): doc is Document => doc !== null),
        created_at: project.created_at,
        updatedAt: project.updated_at,
        isDeleted: project.is_deleted || false,
        deletedAt: project.deleted_at || undefined,
        deletedBy: project.deleted_by || undefined,
        restorationEligibleUntil: project.restoration_eligible_until || undefined
      };

      set({ selectedProject: fullProject, isLoading: false });

    } catch (error) {
      console.error('Error fetching project:', error);
      set({ error: (error as Error).message, isLoading: false, selectedProject: null });
      toast.error((error as Error).message || 'Failed to load project details');
      throw error; // Re-throw to allow handling by the component
    }
  },
  addProject: async (projectData) => {
    set({ isLoading: true, error: null });
    try {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          portfolio_id: projectData.portfolioId,
          name: projectData.name,
          description: projectData.description,
          project_code: projectData.projectCode,
          initiative_code: projectData.initiativeCode,
          phase: projectData.phase,
          start_date: projectData.startDate,
          end_date: projectData.endDate,
          status: projectData.status,
          budget: projectData.budget,
          actual_cost: projectData.actualCost,
          forecasted_spend: projectData.forecastedSpend,
          manager_id: projectData.managerId,
          owning_department: projectData.owningDepartment,
          project_sponsor: projectData.projectSponsor,
          project_owner: projectData.projectOwner,
          strategic_objective: projectData.strategicObjective,
          corporate_kpis: projectData.corporateKPIs,
          // Ensure deliverables match the new structure expected by DB
          // Ensure deliverables match the new structure expected by DB
          // Map deliverables for insertion (ID is generated by DB)
          deliverables: projectData.deliverables?.map(d => ({
            // id: d.id, // ID is omitted for insertion
            description: d.description,
            fromDate: d.fromDate, // Already string | null
            toDate: d.toDate,     // Already string | null
          })) || []
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Assuming stage gates, milestones, risks, resources insertion logic remains the same
      const stageGatesData = projectData.stageGates.map(sg => ({
        project_id: project.id,
        stage: sg.stage,
        status: sg.status,
        notes: sg.notes
      }));
      
      const { error: stageGatesError } = await supabase
        .from('stage_gates')
        .insert(stageGatesData);
      
      if (stageGatesError) throw stageGatesError;
      
      const milestonesData = projectData.milestones.map(m => ({
        project_id: project.id,
        name: m.name,
        due_date: m.dueDate,
        status: m.status
      }));
      
      const { error: milestonesError } = await supabase
        .from('milestones')
        .insert(milestonesData);
      
      if (milestonesError) throw milestonesError;
      
      const risksData = projectData.risks.map(r => ({
        project_id: project.id,
        description: r.description,
        impact: r.impact,
        status: r.status,
        mitigation: r.mitigation
      }));
      
      const { error: risksError } = await supabase
        .from('risks')
        .insert(risksData);
      
      if (risksError) throw risksError;
      
      const resourcesData = projectData.resources.map(r => ({
        project_id: project.id,
        user_id: r.userId,
        name: r.name,
        role: r.role
      }));
      
      const { error: resourcesError } = await supabase
        .from('resources')
        .insert(resourcesData);
      
      if (resourcesError) throw resourcesError;
      
      // Optimistically update the state instead of refetching all projects
      const dbProject = project; // Renamed for clarity
      const inputData = projectData; // Renamed for clarity

      // Construct the new Project object matching the state interface
      const newProjectForState: Project = {
        id: dbProject.id,
        portfolioId: dbProject.portfolio_id,
        name: dbProject.name,
        description: dbProject.description || '',
        projectCode: dbProject.project_code || '',
        initiativeCode: dbProject.initiative_code || '',
        phase: dbProject.phase as ProjectPhase || undefined,
        startDate: dbProject.start_date,
        endDate: dbProject.end_date,
        status: dbProject.status as ProjectStatus,
        budget: Number(dbProject.budget),
        actualCost: Number(dbProject.actual_cost),
        forecastedSpend: Number(dbProject.forecasted_spend || 0),
        managerId: dbProject.manager_id || '',
        owningDepartment: dbProject.owning_department || '',
        projectSponsor: dbProject.project_sponsor || '',
        projectOwner: dbProject.project_owner || '',
        // Assuming email fields are not returned by insert, add if needed
        // ownerEmail: '', sponsorEmail: '', managerEmail: '',
        strategicObjective: dbProject.strategic_objective,
        corporateKPIs: dbProject.corporate_kpis || [],
        // Map deliverables from DB (assuming new structure)
        deliverables: Array.isArray(dbProject.deliverables)
          ? dbProject.deliverables.map((d: any) => ({
              id: d.id || uuidv4(), // Ensure ID exists
              description: d.description || '',
              fromDate: d.fromDate || null,
              toDate: d.toDate || null,
            }))
          : [],
        // Use the input data for related arrays as they were just inserted
        // Note: These might lack IDs if not returned by insert calls for related tables
        stageGates: inputData.stageGates,
        milestones: inputData.milestones,
        risks: inputData.risks,
        resources: inputData.resources,
        documents: [], // Documents are handled separately
        created_at: dbProject.created_at,
        updatedAt: dbProject.updated_at,
        // Explicitly set soft delete fields based on DB default (false)
        isDeleted: false,
        deletedAt: undefined,
        deletedBy: undefined,
        restorationEligibleUntil: undefined,
      };

      set(state => ({
        projects: [newProjectForState, ...state.projects], // Add new project to the beginning of the list
        isLoading: false
      }));
      
      toast.success('Project created successfully');
      // isLoading is already set in the set() call above
    } catch (error) {
      console.error('Error adding project:', error);
      set({ error: (error as Error).message, isLoading: false });
      toast.error('Failed to create project');
    }
  },
  updateProject: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updateData: any = {};
      if (data.name) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.projectCode !== undefined) updateData.project_code = data.projectCode;
      if (data.initiativeCode !== undefined) updateData.initiative_code = data.initiativeCode;
      if (data.phase !== undefined) updateData.phase = data.phase;
      if (data.startDate) updateData.start_date = data.startDate;
      if (data.endDate) updateData.end_date = data.endDate;
      if (data.status) updateData.status = data.status;
      if (data.budget !== undefined) updateData.budget = data.budget;
      if (data.actualCost !== undefined) updateData.actual_cost = data.actualCost;
      if (data.forecastedSpend !== undefined) updateData.forecasted_spend = data.forecastedSpend;
      if (data.managerId) updateData.manager_id = data.managerId;
      if (data.portfolioId) updateData.portfolio_id = data.portfolioId;
      if (data.owningDepartment !== undefined) updateData.owning_department = data.owningDepartment;
      if (data.projectSponsor !== undefined) updateData.project_sponsor = data.projectSponsor;
      if (data.projectOwner !== undefined) updateData.project_owner = data.projectOwner;
      if (data.strategicObjective !== undefined) updateData.strategic_objective = data.strategicObjective;
      if (data.corporateKPIs !== undefined) updateData.corporate_kpis = data.corporateKPIs;
      // Map the new deliverable structure for update
      if (data.deliverables !== undefined) {
          updateData.deliverables = data.deliverables.map(d => ({
              id: d.id || uuidv4(), // Ensure ID exists, generate if new
              description: d.description,
              fromDate: d.fromDate, // Already string | null
              toDate: d.toDate,     // Already string | null
          }));
      }
      
      const { error: projectError } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id);
      
      if (projectError) throw projectError;
      
      if (get().selectedProject?.id === id) {
        await get().fetchProjectById(id);
      } else {
        await get().fetchProjects();
      }
      
      toast.success('Project updated successfully');
      set({ isLoading: false });
    } catch (error) {
      console.error('Error updating project:', error);
      console.error('Supabase error details:', error); // Log full error details
      set({ error: (error as Error).message, isLoading: false });
      toast.error('Failed to update project');
    }
  },
  deleteProject: async (id, options = {}) => {
    set({ isLoading: true, error: null });
    try {
      // Get current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Soft delete implementation
      const softDeleteData = {
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: user.id,
        // Set restoration eligibility to 30 days from now
        restoration_eligible_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        ...options // Allow passing additional metadata
      };

      const { error } = await supabase
        .from('projects')
        .update(softDeleteData)
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        projects: state.projects.map(project =>
          project.id === id
            ? {
                ...project,
                isDeleted: true,
                deletedAt: softDeleteData.deleted_at,
                deletedBy: softDeleteData.deleted_by,
                restorationEligibleUntil: softDeleteData.restoration_eligible_until
              }
            : project
        ),
        selectedProject: state.selectedProject?.id === id
          ? {
              ...state.selectedProject,
              isDeleted: true,
              deletedAt: softDeleteData.deleted_at,
              deletedBy: softDeleteData.deleted_by,
              restorationEligibleUntil: softDeleteData.restoration_eligible_until
            }
          : state.selectedProject,
        isLoading: false
      }));
      
      // Trigger notification
      toast.success('Project soft-deleted. Restoration available for 30 days.');

      // Optional: Log audit trail
      await supabase
        .from('audit_logs')
        .insert({
          action: 'soft_delete',
          entity_type: 'project',
          entity_id: id,
          user_id: user.id,
          metadata: JSON.stringify(softDeleteData)
        });

    } catch (error) {
      console.error('Error soft-deleting project:', error);
      set({ error: (error as Error).message, isLoading: false });
      toast.error('Failed to soft-delete project');
    }
  },

  // New method to restore a soft-deleted project
  restoreProject: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Get current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check restoration eligibility
      const { data: project, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Validate restoration eligibility
      if (project.is_deleted !== true) {
        throw new Error('Project is not soft-deleted and cannot be restored');
      }

      const restorationEligibleUntil = project.restoration_eligible_until
        ? new Date(project.restoration_eligible_until)
        : null;

      if (restorationEligibleUntil && restorationEligibleUntil < new Date()) {
        throw new Error('Project restoration window has expired.');
      }

      // Restore project
      const { error } = await supabase
        .from('projects')
        .update({
          is_deleted: false,
          deleted_at: null,
          deleted_by: null,
          restoration_eligible_until: null
        })
        .eq('id', id);
      
      if (error) throw error;

      set(state => ({
        projects: state.projects.map(project =>
          project.id === id
            ? {
                ...project,
                isDeleted: false,
                deletedAt: null,
                deletedBy: null,
                restorationEligibleUntil: null
              }
            : project
        ),
        selectedProject: state.selectedProject?.id === id
          ? {
              ...state.selectedProject,
              isDeleted: false,
              deletedAt: null,
              deletedBy: null,
              restorationEligibleUntil: null
            }
          : state.selectedProject,
        isLoading: false
      }));

      // Log restoration audit trail
      await supabase
        .from('audit_logs')
        .insert({
          action: 'restore',
          entity_type: 'project',
          entity_id: id,
          user_id: user.id
        });

      toast.success('Project successfully restored');
    } catch (error) {
      console.error('Error restoring project:', error);
      set({ error: (error as Error).message, isLoading: false });
      toast.error((error as Error).message || 'Failed to restore project');
      throw error; // Re-throw the error so the caller knows it failed
    }
  },
  addRisk: async (projectId, risk) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('risks')
        .insert({
          project_id: projectId,
          description: risk.description,
          impact: risk.impact,
          status: risk.status,
          mitigation: risk.mitigation
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Instead of manually updating state, refetch the project data
      await get().fetchProjectById(projectId);
      
      // Ensure loading state is reset after refetch completes (fetchProjectById handles this)
      // set({ isLoading: false }); // No longer needed here
      
      toast.success('Risk added successfully');
    } catch (error) {
      console.error('Error adding risk:', error);
      if (error instanceof Error) {
        console.error('Supabase error message:', error.message);
      } else if (error && typeof error === 'object') {
        console.error('Supabase error details:', JSON.stringify(error));
      }
      set({ error: (error as any).message ?? JSON.stringify(error), isLoading: false });
      toast.error('Failed to add risk');
    }
  },
  updateRisk: async (projectId, riskId, data) => {
    set({ isLoading: true, error: null });
    try {
      const updateData: any = {};
      if (data.description) updateData.description = data.description;
      if (data.impact) updateData.impact = data.impact;
      if (data.status) updateData.status = data.status;
      if (data.mitigation !== undefined) updateData.mitigation = data.mitigation;
      
      const { error } = await supabase
        .from('risks')
        .update(updateData)
        .eq('id', riskId);
      
      if (error) throw error;
      
      set(state => {
        const updatedProjects = state.projects.map(project => {
          if (project.id === projectId) {
            return {
              ...project,
              risks: project.risks.map(risk => 
                risk.id === riskId ? { ...risk, ...data } : risk
              ),
              updatedAt: new Date().toISOString()
            };
          }
          return project;
        });
        
        const updatedSelectedProject = state.selectedProject?.id === projectId
          ? {
              ...state.selectedProject,
              risks: state.selectedProject.risks.map(risk => 
                risk.id === riskId ? { ...risk, ...data } : risk
              ),
              updatedAt: new Date().toISOString()
            }
          : state.selectedProject;
        
        return {
          projects: updatedProjects,
          selectedProject: updatedSelectedProject,
          isLoading: false
        };
      });
      
      toast.success(`Risk ${riskId} updated successfully`);
    } catch (error) {
      const errorMsg = (error as Error).message;
      console.error(`Error updating risk ${riskId}:`, errorMsg);
      set({ error: errorMsg, isLoading: false });
      // Provide a more specific error message to the user
      toast.error(`Failed to update risk: ${errorMsg}`);
    }
  },
  addMilestone: async (projectId, milestone) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('milestones')
        .insert({
          project_id: projectId,
          name: milestone.name,
          due_date: milestone.dueDate,
          status: milestone.status
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const newMilestone: Milestone = {
        id: data.id,
        name: data.name,
        dueDate: data.due_date,
        status: data.status as MilestoneStatus
      };
      
      set(state => {
        const updatedProjects = state.projects.map(project => {
          if (project.id === projectId) {
            return {
              ...project,
              milestones: [...project.milestones, newMilestone],
              updatedAt: new Date().toISOString()
            };
          }
          return project;
        });
        
        const updatedSelectedProject = state.selectedProject?.id === projectId
          ? {
              ...state.selectedProject,
              milestones: [...state.selectedProject.milestones, newMilestone],
              updatedAt: new Date().toISOString()
            }
          : state.selectedProject;
        
        return {
          projects: updatedProjects,
          selectedProject: updatedSelectedProject,
          isLoading: false
        };
      });
      
      toast.success('Milestone added successfully');
    } catch (error) {
      console.error('Error adding milestone:', error);
      set({ error: (error as Error).message, isLoading: false });
      toast.error('Failed to add milestone');
    }
  },
  updateMilestone: async (projectId, milestoneId, data) => {
    set({ isLoading: true, error: null });
    try {
      const updateData: any = {};
      if (data.name) updateData.name = data.name;
      if (data.dueDate) updateData.due_date = data.dueDate;
      if (data.status) updateData.status = data.status;
      
      const { error } = await supabase
        .from('milestones')
        .update(updateData)
        .eq('id', milestoneId);
      
      if (error) throw error;
      
      set(state => {
        const updatedProjects = state.projects.map(project => {
          if (project.id === projectId) {
            return {
              ...project,
              milestones: project.milestones.map(milestone => 
                milestone.id === milestoneId ? { ...milestone, ...data } : milestone
              ),
              updatedAt: new Date().toISOString()
            };
          }
          return project;
        });
        
        const updatedSelectedProject = state.selectedProject?.id === projectId
          ? {
              ...state.selectedProject,
              milestones: state.selectedProject.milestones.map(milestone => 
                milestone.id === milestoneId ? { ...milestone, ...data } : milestone
              ),
              updatedAt: new Date().toISOString()
            }
          : state.selectedProject;
        
        return {
          projects: updatedProjects,
          selectedProject: updatedSelectedProject,
          isLoading: false
        };
      });
      
      toast.success('Milestone updated successfully');
    } catch (error) {
      console.error('Error updating milestone:', error);
      set({ error: (error as Error).message, isLoading: false });
      toast.error('Failed to update milestone');
    }
  },
  updateStageGate: async (projectId, stageKey, data: Partial<StageGate>) => {
    set({ isLoading: true, error: null });
    const currentState = get();
    const project = currentState.selectedProject?.id === projectId ? currentState.selectedProject : currentState.projects.find(p => p.id === projectId);
    const currentGate = project?.stageGates.find(sg => sg.stage === stageKey);

    if (!currentGate) {
      const errorMsg = `Stage gate ${stageKey} not found for project ${projectId}`;
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
      return;
    }

    try {
      // 1. Validate incoming data against the schema
      const validationResult = StageGateUpdateSchema.safeParse(data);
      if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        throw new Error(`Validation failed: ${errorMessages}`);
      }
      const validatedData = validationResult.data;

      // 2. Prerequisite Check (Example: Ensure previous gate is 'completed')
      const gateOrder: StageGate['stage'][] = ['G0', 'G1', 'G2', 'G3', 'G4'];
      const currentIndex = gateOrder.indexOf(stageKey);
      if (currentIndex > 0) {
        const previousStageKey = gateOrder[currentIndex - 1];
        const previousGate = project?.stageGates.find(sg => sg.stage === previousStageKey);
        if (previousGate?.status !== 'completed') {
           throw new Error(`Cannot update ${stageKey}: Prerequisite stage ${previousStageKey} is not completed.`);
        }
      }
      
      // 3. Date Consistency Check (Example: Ensure update date is not before previous gate completion)
      // This requires storing completion dates or more complex logic based on `updatedAt`

      // 4. Stakeholder Approval Check (Example: If status is 'completed', ensure approvalStatus is 'approved' in the same update)
      // Check if the validated update intends to set status to 'completed'
      if (validatedData.status === 'completed') {
         // If setting to completed, the approvalStatus in the same update must be 'approved'
         if (validatedData.approvalStatus !== 'approved') {
            throw new Error(`Cannot mark ${stageKey} as completed without 'approved' status.`);
         }
      }

      // Prepare data for Supabase update (map validated fields to DB columns)
      const updateData: any = {};
      if (validatedData.status) updateData.status = validatedData.status;
      if (validatedData.notes !== undefined) updateData.notes = validatedData.notes;
      if (validatedData.rationale !== undefined) updateData.rationale = validatedData.rationale; // Assuming 'rationale' column exists
      if (validatedData.approvalStatus !== undefined) updateData.approval_status = validatedData.approvalStatus; // Assuming 'approval_status' column
      if (validatedData.nextSteps !== undefined) updateData.next_steps = validatedData.nextSteps; // Assuming 'next_steps' column
      // Add other fields like owner_id, due_date if they are part of the update
      updateData.updated_at = new Date().toISOString();

      // Fetch the specific stage gate ID to update
      const { data: stageGateRecord, error: fetchError } = await supabase
        .from('stage_gates')
        .select('id')
        .eq('project_id', projectId)
        .eq('stage', stageKey)
        .single();

      if (fetchError) throw new Error(`Failed to fetch stage gate ID: ${fetchError.message}`);
      if (!stageGateRecord) throw new Error(`Stage gate record not found for ${stageKey}`);

      // Perform the update
      const { error: updateError } = await supabase
        .from('stage_gates')
        .update(updateData)
        .eq('id', stageGateRecord.id);

      if (updateError) throw new Error(`Supabase update failed: ${updateError.message}`);

      // Update local state optimistically or refetch
      set(state => {
        const updatedProjects = state.projects.map(project => {
          if (project.id === projectId) {
            return {
              ...project,
              stageGates: project.stageGates.map(stage => 
                stage.stage === stageKey
                  ? {
                      ...stage,
                      ...validatedData, // Use validated data
                      updatedAt: updateData.updated_at // Use the timestamp sent to DB
                    }
                  : stage
              ),
              updatedAt: updateData.updated_at // Update project timestamp as well
            };
          }
          return project;
        });
        
        const updatedSelectedProject = state.selectedProject?.id === projectId
          ? {
              ...state.selectedProject,
              stageGates: state.selectedProject.stageGates.map(stage => 
                stage.stage === stageKey
                  ? {
                      ...stage,
                      ...validatedData, // Use validated data
                      updatedAt: updateData.updated_at // Use the timestamp sent to DB
                    }
                  : stage
              ),
              updatedAt: updateData.updated_at // Update project timestamp as well
            }
          : state.selectedProject;
        
        return {
          projects: updatedProjects,
          selectedProject: updatedSelectedProject,
          isLoading: false
        };
      });
      
      toast.success(`Stage gate ${stageKey} updated successfully`);
    } catch (error) {
      const errorMsg = (error as Error).message;
      console.error(`Error updating stage gate ${stageKey}:`, errorMsg);
      set({ error: errorMsg, isLoading: false });
      toast.error(`Failed to update stage gate: ${errorMsg}`); // Show specific error
    }
  },
  addResource: async (projectId, resource) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Need a way to link this to an actual user ID if applicable,
      // for now just inserting name/role associated with the project.
      const { data, error } = await supabase
        .from('resources')
        .insert({
          project_id: projectId,
          name: resource.name,
          role: resource.role,
          // user_id: resource.userId // Add if linking to users table
        })
        .select()
        .single();

      if (error) throw error;

      // Refetch project data to update UI
      await get().fetchProjectById(projectId);

      toast.success('Team member added successfully');
    } catch (error) {
      console.error('Error adding resource:', error);
      if (error instanceof Error) {
        console.error('Supabase error message:', error.message);
      } else if (error && typeof error === 'object') {
        console.error('Supabase error details:', JSON.stringify(error));
      }
      set({ error: (error as any).message ?? JSON.stringify(error), isLoading: false });
      toast.error('Failed to add team member');
      throw error; // Re-throw error so the form handler knows it failed
    }
  },
  // --- Document Actions Implementation ---
  fetchDocuments: async (projectId) => {
    // This might be redundant if documents are fetched within fetchProjectById
    // Or implement if documents need separate fetching/refreshing
    set({ isLoading: true });
    try {
      // Cast to 'any' to bypass outdated generated types
      // Call from() without type args for unknown table
      // Cast supabase to 'any' to fully bypass type checking for unknown table
      const { data, error } = await (supabase as any)
        .from('documents')
        .select('*')
        .eq('project_id' as any, projectId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      // Map DB data to Document interface, ensuring all fields are present
      const documents: Document[] = (data as any[])?.map((doc: any): Document | null => {
        // Basic validation on fetched data
        if (!doc.id || !doc.project_id || !doc.file_name || !doc.file_path || !doc.file_size || !doc.file_type || !doc.uploaded_at) {
          console.warn("Skipping incomplete document record from DB:", doc);
          return null; // Skip incomplete records
        }
        const fileType = ALLOWED_DOC_TYPES.includes(doc.file_type as any) ? doc.file_type : null;
        if (!fileType) {
           console.warn(`Skipping document with unsupported file type '${doc.file_type}':`, doc);
           return null; // Skip unsupported types
        }

        return {
          id: doc.id,
          projectId: doc.project_id,
          fileName: doc.file_name,
          filePath: doc.file_path,
          fileSize: doc.file_size,
          fileType: fileType, // Use validated file type
          owner: doc.owner || 'Unknown Owner', // Provide default if owner is missing
          tags: Array.isArray(doc.tags) ? doc.tags : [], // Ensure tags is an array, default to empty
          uploadedAt: doc.uploaded_at,
        };
      }).filter((doc): doc is Document => doc !== null); // Filter out null (skipped) entries

      set(state => ({
        selectedProject: state.selectedProject?.id === projectId
          ? { ...state.selectedProject, documents }
          : state.selectedProject,
        isLoading: false,
        error: null,
      }));

    } catch (error) {
      console.error('Error fetching documents:', error);
      set({ error: (error as Error).message, isLoading: false });
      toast.error('Failed to load documents');
    }
  },

  uploadDocument: async (projectId, file) => {
    set({ isUploadingDocument: true }); // Set upload-specific loading state
    // Removed incorrect set({ isLoading: true });
    try {
      // --- Validation Step ---
      if (!file) throw new Error("No file selected for upload.");
      if (!projectId) throw new Error("Project ID is missing.");

      // Validate file type on client-side before upload attempt
      if (!ALLOWED_DOC_TYPES.includes(file.type as any)) {
        throw new Error(`Unsupported file type: ${file.type}. Allowed: ${ALLOWED_DOC_TYPES.join(', ')}`);
      }

      // Placeholder for owner - Replace with actual auth user logic
      // In a real app, get the user ID/name from an auth store (e.g., useAuthStore)
      const currentUser = { id: 'user-uuid-placeholder', name: 'Current User' }; // Replace with actual auth logic
      const ownerName = currentUser.name; // Or use user ID based on requirements

      console.log(`[uploadDocument] Attempting upload for projectId: ${projectId}, File: ${file.name}, Size: ${file.size}, Type: ${file.type}, Owner: ${ownerName}`);

      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`; // Add randomness for uniqueness
      const filePath = `${projectId}/${uniqueFileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('project-documents') // Assuming 'project-documents' bucket exists
        .upload(filePath, file);

      if (uploadError) {
        console.error('Supabase Storage upload error:', uploadError);
        throw new Error(`Storage Error: ${uploadError.message}`);
      }

      // --- Prepare Metadata for DB Insert ---
      const documentMetadata = {
        // projectId is passed separately to insert
        fileName: file.name, // Use original file name for metadata
        filePath: filePath, // Use unique path for storage
        fileSize: file.size,
        fileType: file.type as typeof ALLOWED_DOC_TYPES[number], // Assert type after validation
        owner: ownerName, // Use assigned owner
        tags: ['uncategorized'], // Default tags, UI should allow modification
        // description: 'Uploaded document' // Add if description field exists in DB
      };

      // Validate metadata before inserting
      const validationResult = DocumentInsertSchema.safeParse(documentMetadata);
      if (!validationResult.success) {
         // If validation fails, remove the already uploaded file from storage
         await supabase.storage.from('project-documents').remove([filePath]);
         const errorMessages = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
         throw new Error(`Document metadata validation failed: ${errorMessages}`);
      }
      const validatedMetadata = validationResult.data;

      // --- Add Metadata to DB Table ---
      console.log(`[uploadDocument] Inserting validated metadata to documents table for path: ${filePath}`);
      // --- Temporary Workaround: Cast supabase to 'any' ---
      const { data: dbRecord, error: insertError } = await (supabase as any)
        .from('documents') // Now TS won't complain about the table name
        .insert({
          project_id: projectId, // Explicitly pass projectId here
          ...validatedMetadata // Spread the validated fields (fileName, filePath, fileSize, fileType, owner, tags)
        })
        .select()
        .single();

      if (insertError) {
        console.error('Supabase DB insert error:', insertError);
        // Attempt to remove the uploaded file if DB insert fails
        await supabase.storage.from('project-documents').remove([filePath]);
        throw new Error(`Database Error: ${insertError.message}`);
      }
      if (!dbRecord) {
         // Handle case where insert succeeded but no data was returned (should not happen with .single())
         await supabase.storage.from('project-documents').remove([filePath]);
         throw new Error('Failed to retrieve document record after insert.');
      }

       // --- Map DB Record to State Interface ---
       // --- Temporary Workaround: Cast dbRecord to 'any' ---
       const dbRecordAny = dbRecord as any;
       // Ensure all properties of the Document interface are mapped
       const newDocument: Document = {
         id: dbRecordAny.id,
         projectId: dbRecordAny.project_id, // Should match projectId
         fileName: dbRecordAny.file_name,
         filePath: dbRecordAny.file_path,
         fileSize: dbRecordAny.file_size,
         fileType: dbRecordAny.file_type as typeof ALLOWED_DOC_TYPES[number], // Ensure type safety
         owner: dbRecordAny.owner, // Get owner from DB record
         tags: Array.isArray(dbRecordAny.tags) ? dbRecordAny.tags : [], // Get tags from DB record
         uploadedAt: dbRecordAny.uploaded_at,
       };

      // Update state by adding the new document
       set(state => {
         const updatedSelectedProject = state.selectedProject?.id === projectId
           ? {
               ...state.selectedProject,
               documents: [newDocument, ...(state.selectedProject.documents || [])], // Add to beginning
               updatedAt: new Date().toISOString() // Also update project timestamp
             }
           : state.selectedProject;

         return {
           selectedProject: updatedSelectedProject,
           isUploadingDocument: false, // Clear upload-specific loading state
           error: null,
         };
       });


      toast.success(`Document "${file.name}" uploaded successfully`);

    } catch (error) {
      console.error('Error uploading document:', error);
      set({ isUploadingDocument: false }); // Clear upload-specific loading state on error
      set({ error: (error as Error).message, isLoading: false });
      toast.error(`Failed to upload document: ${(error as Error).message}`);
    }
  },

}));
