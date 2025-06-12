// type definitions for the app
export interface Course {
  name: string
  credits: number
  grade: string
}

export interface Semester {
  name: string
  courses: Course[]
}

export interface Theme {
  background: string
  card: string
  text: string
  subtext: string
  button: string
  primary: string
  border: string
  success: string
  danger: string
}

// Firebase template types
export interface TemplateStructure {
  semesters: Semester[]
}

export interface Template {
  id?: string
  name: string
  description: string
  structure: TemplateStructure
  createdBy: string
  isApproved: boolean
  createdAt: Date | string | any // Allow FieldValue from Firestore
}

// Auth user type
export interface User {
  uid: string
  email: string | null
  displayName: string | null
  emailVerified?: boolean
}
