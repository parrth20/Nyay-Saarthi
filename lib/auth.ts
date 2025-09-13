// Simple authentication utilities
export interface User {
  id: string
  name: string
  email: string
}

// Mock authentication - in real app, this would connect to your auth service
export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null

  const user = localStorage.getItem("user")
  return user ? JSON.parse(user) : null
}

export const login = (email: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    // Mock login - replace with real authentication
    setTimeout(() => {
      if (email && password) {
        const user: User = {
          id: "1",
          name: "उपयोगकर्ता",
          email: email,
        }
        localStorage.setItem("user", JSON.stringify(user))
        resolve(user)
      } else {
        reject(new Error("अमान्य क्रेडेंशियल"))
      }
    }, 1000)
  })
}

export const logout = (): void => {
  localStorage.removeItem("user")
}

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null
}
