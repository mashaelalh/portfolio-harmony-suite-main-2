import dotenv from 'dotenv';
dotenv.config({ path: '.env.test.local' });

import { supabase } from '@/integrations/supabase/client';
import { useProjectStore } from '@/lib/store/projectStore';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Attempt to get Supabase credentials from environment
function getSupabaseCredentials() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    console.warn('No Supabase URL found. Please set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL');
  }

  if (!supabaseServiceRoleKey) {
    console.warn('No Supabase Service Role Key found. Please set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY');
  }

  return { supabaseUrl, supabaseServiceRoleKey };
}

const { supabaseUrl, supabaseServiceRoleKey } = getSupabaseCredentials();

describe('Project Soft Delete Integration', () => {
  // Provide clear guidance if credentials are missing
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    it('Skipping tests: Supabase credentials not found', () => {
      console.error(`
        ===== INTEGRATION TEST SKIPPED =====
        To run Supabase integration tests, set the following environment variables:
        - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
        - SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key

        How to set these:
        1. Check your Supabase project settings
        2. Use .env file or export in terminal
        3. Ensure these are NOT committed to version control
        ===================================
      `);
    });
    return;
  }

  let testProjectId: string;
  let testPortfolioId: string;
  let testUserId: string;
  let testUserEmail: string;
  let adminClient: SupabaseClient;
  let testClient: SupabaseClient;

  beforeEach(async () => {
    // Generate a unique, valid email
    const uniqueId = uuidv4();
    testUserEmail = `test-${uniqueId}@portfolioharmony.com`;

    // Initialize admin client if not already created
    if (!adminClient) {
      adminClient = createClient(
        supabaseUrl!,
        supabaseServiceRoleKey!
      );
    }

    // Create test user directly using admin API
    const { data: userData, error: userError } = await adminClient.auth.admin.createUser({
      email: testUserEmail,
      password: 'TestPassword123!',
      email_confirm: true
    });

    if (userError) {
      console.error('User creation error:', userError);
      throw userError;
    }

    testUserId = userData.user.id;
    console.log('Created test user with ID:', testUserId);

    // Create authenticated test client
    testClient = createClient(supabaseUrl!, supabaseServiceRoleKey!);
    const { error: authError } = await testClient.auth.signInWithPassword({
      email: testUserEmail,
      password: 'TestPassword123!'
    });
    if (authError) throw authError;

    // Create a test portfolio with exact type matching constraint
    const { data: portfolioData, error: portfolioError } = await adminClient
      .from('portfolios')
      .insert({
        name: 'Test Soft Delete Portfolio',
        description: 'Portfolio for soft delete integration tests',
        type: 'corporate', // Must match exactly with constraint values
        created_by: testUserId
      })
      .select()
      .single();

    if (portfolioError) {
      console.error('Portfolio creation error:', portfolioError);
      throw portfolioError;
    }
    testPortfolioId = portfolioData.id;

    // Create a test project using admin client
    const { data: project, error: insertError } = await adminClient
      .from('projects')
      .insert({
        name: 'Test Soft Delete Project',
        description: 'Integration test for soft delete',
        portfolio_id: testPortfolioId,
        manager_id: testUserId,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'not_started',
        budget: 10000,
        actual_cost: 0
      })
      .select()
      .single();

    if (insertError) {
      console.error('Project creation error:', insertError);
      throw insertError;
    }
    testProjectId = project.id;
  });

  afterEach(async () => {
    
    // Clean up test project and portfolio using admin client
    if (testProjectId) {
      await adminClient
        .from('projects')
        .delete()
        .eq('id', testProjectId);
    }
    
    if (testPortfolioId) {
      await adminClient
        .from('portfolios')
        .delete()
        .eq('id', testPortfolioId);
    }

    // Delete test user
    try {
      await adminClient.auth.admin.deleteUser(testUserId);
    } catch (error) {
      console.warn('Failed to delete test user:', error);
    }
  });

  it('should soft delete a project', async () => {
    const projectStore = useProjectStore.getState();
    
    // Verify project exists before deletion
    const { data: preDeleteProject } = await testClient
      .from('projects')
      .select('*')
      .eq('id', testProjectId)
      .single();
    console.log('Project before deletion:', preDeleteProject);
    
    await projectStore.deleteProject(testProjectId);

    const { data: deletedProject, error } = await adminClient
      .from('projects')
      .select('*')
      .eq('id', testProjectId)
      .single();

    expect(error).toBeNull();
    expect(deletedProject).toBeTruthy();
    expect(deletedProject.is_deleted).toBe(true);
    expect(deletedProject.deleted_at).toBeTruthy();
    expect(deletedProject.deleted_by).toBe(testUserId);
    expect(deletedProject.restoration_eligible_until).toBeTruthy();
  });

  it('should restore a soft-deleted project', async () => {
    const projectStore = useProjectStore.getState();
    
    // First, soft delete the project
    await projectStore.deleteProject(testProjectId);

    // Then, restore the project
    await projectStore.restoreProject(testProjectId);

    const { data: restoredProject, error } = await adminClient
      .from('projects')
      .select('*')
      .eq('id', testProjectId)
      .single();

    expect(error).toBeNull();
    expect(restoredProject).toBeTruthy();
    expect(restoredProject.is_deleted).toBe(false);
    expect(restoredProject.deleted_at).toBeNull();
    expect(restoredProject.deleted_by).toBeNull();
    expect(restoredProject.restoration_eligible_until).toBeNull();
  });

  it('should prevent restoring a project after restoration window expires', async () => {
    const projectStore = useProjectStore.getState();
    
    // Soft delete the project
    await projectStore.deleteProject(testProjectId);
    
    // Verify soft delete was successful
    const { data: softDeletedProject } = await testClient
      .from('projects')
      .select('*')
      .eq('id', testProjectId)
      .single();
    console.log('Soft deleted project:', softDeletedProject);

    await adminClient
      .from('projects')
      .update({ 
        restoration_eligible_until: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() 
      })
      .eq('id', testProjectId);

    // Attempt to restore should fail
    await expect(projectStore.restoreProject(testProjectId))
      .rejects
      .toThrow('Project restoration window has expired');
  });

  it('should log audit trail for soft delete and restoration', async () => {
    const projectStore = useProjectStore.getState();
    
    // Soft delete the project
    await projectStore.deleteProject(testProjectId);

    const { data: deleteAuditLogs, error: deleteAuditError } = await adminClient
      .from('audit_logs')
      .select('*')
      .eq('entity_id', testProjectId)
      .eq('action', 'soft_delete')
      .single();

    expect(deleteAuditError).toBeNull();
    expect(deleteAuditLogs).toBeTruthy();
    expect(deleteAuditLogs.entity_type).toBe('project');
    expect(deleteAuditLogs.user_id).toBe(testUserId);

    // Restore the project
    await projectStore.restoreProject(testProjectId);

    const { data: restoreAuditLogs, error: restoreAuditError } = await adminClient
      .from('audit_logs')
      .select('*')
      .eq('entity_id', testProjectId)
      .eq('action', 'restore')
      .single();

    expect(restoreAuditError).toBeNull();
    expect(restoreAuditLogs).toBeTruthy();
    expect(restoreAuditLogs.entity_type).toBe('project');
    expect(restoreAuditLogs.user_id).toBe(testUserId);
  });
});