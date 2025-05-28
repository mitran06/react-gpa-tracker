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
