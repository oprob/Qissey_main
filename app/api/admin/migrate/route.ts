import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

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

    // Execute the migration SQL
    const migrationSQL = `
      -- Function to check if user is admin
      CREATE OR REPLACE FUNCTION is_admin_user()
      RETURNS BOOLEAN AS $$
      BEGIN
        RETURN EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() 
          AND role IN ('admin', 'super_admin')
        );
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Admin users can insert product variants
      CREATE POLICY "Admins can insert product variants" ON product_variants
        FOR INSERT WITH CHECK (is_admin_user());

      -- Admin users can update product variants
      CREATE POLICY "Admins can update product variants" ON product_variants
        FOR UPDATE USING (is_admin_user());

      -- Admin users can delete product variants
      CREATE POLICY "Admins can delete product variants" ON product_variants
        FOR DELETE USING (is_admin_user());
    `;

    // Execute each SQL statement separately
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

    for (const statement of statements) {
      const { error } = await supabase.rpc('exec_sql', { query: statement });
      if (error) {
        console.error('Statement error:', error, 'Statement:', statement);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
    
    if (error) {
      console.error('Migration error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Migration execution error:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}