"use client";

import {useEffect, useRef} from "react";
import {useAuthStore} from "@/store/auth-store";
import {authApi} from "@/lib/api";
import {AUTH_TOKEN_KEY} from "@/lib/constants";

export function useAuth() {
    const {user, isAuthenticated, isLoading, login, logout} = useAuthStore();
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token && !useAuthStore.getState().user) {
            authApi
                .me()
                .then((res) => useAuthStore.getState().setUser(res.data))
                .catch(() => {
                    useAuthStore.getState().logout();
                })
                .finally(() => useAuthStore.getState().setLoading(false));
        } else {
            useAuthStore.getState().setLoading(false);
        }
    }, []);

    return {user, isAuthenticated, isLoading, login, logout};
}
