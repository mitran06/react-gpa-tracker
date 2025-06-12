import {
  collection,
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { auth, db } from '../../firebaseConfig'
import type { Template, TemplateStructure } from '../types'

const TEMPLATES_COLLECTION = 'templates'

export class TemplateService {  // Submit a new template (marked as not approved by default)
  static async submitTemplate(
    name: string,
    description: string,
    structure: TemplateStructure,
    userEmail: string
  ): Promise<string> {
    try {
      // Extract username from email (remove domain)
      const createdBy = userEmail.split('@')[0]
      
      const template: Omit<Template, 'id'> = {
        name,
        description,
        structure,
        createdBy,
        isApproved: false,
        createdAt: serverTimestamp()
      }

      console.log('📝 Submitting template:', { name, createdBy })
      const docRef = await addDoc(collection(db, TEMPLATES_COLLECTION), template)
      console.log('✅ Template submitted successfully:', docRef.id)
      return docRef.id
    } catch (error) {
      console.error('❌ Error submitting template:', error)
      throw error
    }
  }

  // Get all approved templates
  static async getApprovedTemplates(): Promise<Template[]> {
    try {
      const q = query(
        collection(db, TEMPLATES_COLLECTION),
        where('isApproved', '==', true),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const templates: Template[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        templates.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          structure: data.structure,
          createdBy: data.createdBy,
          isApproved: data.isApproved,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt
        })
      })
      
      return templates
    } catch (error) {
      console.error('Error getting approved templates:', error)
      throw error
    }
  }

  // Get all pending templates (for admin review)
  static async getPendingTemplates(): Promise<Template[]> {
    try {
      const q = query(
        collection(db, TEMPLATES_COLLECTION),
        where('isApproved', '==', false),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const templates: Template[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        templates.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          structure: data.structure,
          createdBy: data.createdBy,
          isApproved: data.isApproved,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt
        })
      })
      
      return templates
    } catch (error) {
      console.error('Error getting pending templates:', error)
      throw error
    }
  }
  // Approve a template (admin only)
  static async approveTemplate(templateId: string): Promise<void> {
    try {
      console.log('🔄 Approving template:', templateId)
      const templateRef = doc(db, TEMPLATES_COLLECTION, templateId)
      await updateDoc(templateRef, {
        isApproved: true
      })
      console.log('✅ Template approved successfully:', templateId)
    } catch (error) {
      console.error('❌ Error approving template:', error)
      throw error
    }
  }

  // Delete/reject a template (admin only)
  static async deleteTemplate(templateId: string): Promise<void> {
    try {
      console.log('🔄 Deleting template:', templateId)
      const templateRef = doc(db, TEMPLATES_COLLECTION, templateId)
      await deleteDoc(templateRef)
      console.log('✅ Template deleted successfully:', templateId)
    } catch (error) {
      console.error('❌ Error deleting template:', error)
      throw error
    }
  }
}
