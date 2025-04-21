import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { describe, it, expect } from 'vitest';

describe('Projects Table Soft Delete Schema', () => {
  it('should have soft delete columns', async () => {
    // Use typed query method
    const { data, error } = await supabase
      .from('projects')
      .select('id, is_deleted, deleted_at, deleted_by, restoration_eligible_until')
      .limit(1);

    expect(error).toBeNull();
    expect(data).toBeTruthy();

    // Verify column existence through query structure
    const columns = data ? Object.keys(data[0] || {}) : [];
    
    const softDeleteColumns = [
      'is_deleted',
      'deleted_at',
      'deleted_by',
      'restoration_eligible_until'
    ];

    softDeleteColumns.forEach(column => {
      expect(columns).toContain(column);
    });
  });

  it('should verify soft delete columns default values', async () => {
    // Create a test project to verify default values
    const { data: newProject, error: insertError } = await supabase
      .from('projects')
      .insert({
        name: 'Schema Verification Project',
        description: 'Temporary project for schema testing',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'not_started',
        budget: 0,
        actual_cost: 0,
        manager_id: 'test-manager-id'
      })
      .select()
      .single();

    expect(insertError).toBeNull();
    expect(newProject).toBeTruthy();

    // Verify default values for soft delete columns
    expect(newProject?.is_deleted).toBe(false);
    expect(newProject?.deleted_at).toBeNull();
    expect(newProject?.deleted_by).toBeNull();
    expect(newProject?.restoration_eligible_until).toBeNull();

    // Clean up the test project
    if (newProject?.id) {
      await supabase
        .from('projects')
        .delete()
        .eq('id', newProject.id);
    }
  });
});

describe('Portfolios Table Schema', () => {
  it('should have required columns', async () => {
    const { data, error } = await supabase
      .from('portfolios')
      .select('id, name, created_by, is_deleted, deleted_at, deleted_by, restoration_eligible_until')
      .limit(1);

    expect(error).toBeNull();
    expect(data).toBeTruthy();

    const columns = data ? Object.keys(data[0] || {}) : [];
    const requiredColumns = [
      'created_by',
      'is_deleted',
      'deleted_at',
      'deleted_by',
      'restoration_eligible_until'
    ];

    requiredColumns.forEach(column => {
      expect(columns).toContain(column);
    });
  });

  it('should verify soft delete columns default values', async () => {
    // Create a test portfolio to verify default values
    const { data: newPortfolio, error: insertError } = await supabase
      .from('portfolios')
      .insert({
        name: 'Schema Verification Portfolio',
        description: 'Temporary portfolio for schema testing'
      })
      .select()
      .single();

    expect(insertError).toBeNull();
    expect(newPortfolio).toBeTruthy();

    // Verify default values for columns
    expect(newPortfolio?.created_by).toBeNull(); // Will be set by RLS policy
    expect(newPortfolio?.is_deleted).toBe(false);
    expect(newPortfolio?.deleted_at).toBeNull();
    expect(newPortfolio?.deleted_by).toBeNull();
    expect(newPortfolio?.restoration_eligible_until).toBeNull();

    // Clean up the test portfolio
    if (newPortfolio?.id) {
      await supabase
        .from('portfolios')
        .delete()
        .eq('id', newPortfolio.id);
    }
  });
});

describe('Audit Logs', () => {
  it('should have audit_logs table', async () => {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('id, action, entity_type')
      .limit(0);

    expect(error).toBeNull();
  });
});