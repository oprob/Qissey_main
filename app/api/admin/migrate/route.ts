import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Force Node.js runtime for Supabase compatibility
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check if user is admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Define migration statements
    const statements = [
      `CREATE OR REPLACE FUNCTION is_admin_user()
       RETURNS BOOLEAN AS $$
       BEGIN
         RETURN EXISTS (
           SELECT 1 FROM profiles 
           WHERE id = auth.uid() 
           AND role IN ('admin', 'super_admin')
         );
       END;
       $$ LANGUAGE plpgsql SECURITY DEFINER;`,
      
      `CREATE POLICY "Admins can insert product variants" ON product_variants
       FOR INSERT WITH CHECK (is_admin_user());`,
      
      `CREATE POLICY "Admins can update product variants" ON product_variants
       FOR UPDATE USING (is_admin_user());`,
      
      `CREATE POLICY "Admins can delete product variants" ON product_variants
       FOR DELETE USING (is_admin_user());`
    ];

    // Execute each SQL statement separately with proper error handling
    for (const statement of statements) {
      try {
        const { error: statementError } = await supabase.rpc('exec_sql', { query: statement });
        if (statementError) {
          console.error('Statement error:', statementError, 'Statement:', statement);
          return NextResponse.json({ 
            error: `Migration failed: ${statementError.message}`,
            statement: statement.substring(0, 100) + '...' // Truncate for logging
          }, { status: 500 });
        }
      } catch (statementError) {
        console.error('Statement execution error:', statementError, 'Statement:', statement);
        return NextResponse.json({ 
          error: 'Failed to execute migration statement',
          details: statementError instanceof Error ? statementError.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Migration completed successfully',
      statementsExecuted: statements.length
    });

  } catch (error) {
    console.error('Migration execution error:', error);
    return NextResponse.json({ 
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}