"use client";

import {useEffect, useRef} from "react";
import {useAuthStore} from "@/store/auth-store";
import {authApi} from "@/lib/api";
import {AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY} from "@/lib/constants";
import {supabase} from "@/lib/supabase";

export function useAuth() {
    const {user, isAuthenticated, isLoading, login, logout} = useAuthStore();
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const checkSession = async () => {
            try {
                const {data: {session}, error} = await supabase.auth.getSession();
                if (error) throw error;

                if (session) {
                    localStorage.setItem(AUTH_TOKEN_KEY, session.access_token);
                    localStorage.setItem(REFRESH_TOKEN_KEY, session.refresh_token);

                    if (!useAuthStore.getState().user) {
                        const res = await authApi.me();
                        useAuthStore.getState().login(res.data, session.access_token, session.refresh_token);
                    }
                } else {
                    useAuthStore.getState().logout();
                }
            } catch {
                useAuthStore.getState().logout();
            } finally {
                useAuthStore.getState().setLoading(false);
            }
        };

        checkSession();
    }, []);

    return {user, isAuthenticated, isLoading, login, logout};
}
