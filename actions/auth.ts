"use server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

export async function singUp(formData: FormData) {
    const supabase = await createClient()
    const credentials = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        password: formData.get("password") as string,
    };

    const { error, data } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
            data: {
                name: credentials.name,
                phone: credentials.phone
            },
        }
    })

    if (error) return { status: "error", message: error.message, user: null }
    
    if (data?.user?.identities?.length === 0) {
        return {
            status: "pending",
            message: "user already exists"
        }
    }

    
    if (data.user) {
        try {
            await supabase
                .from('userProfile')
                .insert({
                    id: data.user.id,
                    email: credentials.email,
                    name: credentials.name
                })
        } catch (err) {
            
            console.log("Profile insert attempt (may be handled by trigger):", err)
        }
    }

    revalidatePath('/', "layout")
    return { status: "success", message: "User registered successfully", user: data.user }
}

export async function singIn(formData: FormData) {
    const supabase = await createClient()
    const credentials = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    }

    const { error, data } = await supabase.auth.signInWithPassword(credentials);
    if (error) {
        return { status: "error", message: error.message, user: null }
    }

    
    if (data.user) {
        const { data: existingUser } = await supabase
            .from('userProfile')
            .select("id")
            .eq("id", data.user.id)
            .single();

        if (!existingUser) {
            await supabase
                .from('userProfile')
                .insert({
                    id: data.user.id,
                    email: data.user.email,
                    name: data.user.user_metadata?.name || ''
                })
        }
    }

    revalidatePath('/', "layout")
    return { status: "success", message: "User logged in successfully", user: data.user }
}

export async function getCurrentUser() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) return null;
    console.log("Current User from getCurrentUser:", user);
    return user;
}

export async function signOut() {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut();
    if (error) return { status: "error", message: error.message }
    revalidatePath('/', "layout")
    redirect('/')
}