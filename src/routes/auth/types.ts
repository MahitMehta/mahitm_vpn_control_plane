import type { FirebaseAuthError } from "firebase-admin/auth"

export type FirebaseAuthErrorWrapper = {
    errorInfo?: FirebaseAuthError
}