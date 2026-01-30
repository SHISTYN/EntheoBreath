
import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

// Extend Supabase User to match app needs if necessary, 
// or just use it directly. 
// For compatibility with existing components, we might need to map fields.

export const useAuth = () => {
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!supabase) {
            setLoading(false);
            return;
        }

        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signInWithEmail = async (email: string) => {
        if (!supabase) {
            setError("Supabase not configured");
            return { error: { message: "Supabase keys missing" } };
        }
        setLoading(true);
        setError(null);

        // Magic Link Login
        const { error: authError } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin
            }
        });

        if (authError) {
            setError(authError.message);
        }

        setLoading(false);
        return { error: authError };
    };

    const signOut = async () => {
        if (!supabase) return;
        setLoading(true);
        await supabase.auth.signOut();
        setLoading(false);
    };

    return {
        user,
        loading,
        error,
        signInWithEmail,
        signOut,
        isConfigured: isSupabaseConfigured
    };
};
