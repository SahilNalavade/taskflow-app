// Email Service using EmailJS
import emailjs from '@emailjs/browser';

class EmailService {
  constructor() {
    this.isInitialized = false;
    this.serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    this.templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    this.publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  }

  // Initialize EmailJS
  initialize() {
    if (!this.serviceId || !this.templateId || !this.publicKey) {
      console.warn('EmailJS configuration missing. Please set environment variables:');
      console.warn('VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY');
      return false;
    }

    try {
      emailjs.init(this.publicKey);
      this.isInitialized = true;
      console.log('EmailJS initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize EmailJS:', error);
      return false;
    }
  }

  // Generate a secure invitation token
  generateInvitationToken(inviteeEmail, inviterUserId, role) {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const tokenData = {
      email: inviteeEmail,
      inviter: inviterUserId,
      role: role,
      timestamp: timestamp,
      expires: timestamp + (7 * 24 * 60 * 60 * 1000) // 7 days expiration
    };
    
    // Simple encoding (in production, use proper JWT or encryption)
    const token = btoa(JSON.stringify(tokenData));
    return token;
  }

  // Decode invitation token
  decodeInvitationToken(token) {
    try {
      const decoded = JSON.parse(atob(token));
      
      // Check if token is expired
      if (decoded.expires < Date.now()) {
        throw new Error('Invitation token has expired');
      }
      
      return decoded;
    } catch (error) {
      console.error('Invalid invitation token:', error);
      return null;
    }
  }

  // Send invitation email
  async sendInvitationEmail(invitationData) {
    if (!this.isInitialized) {
      if (!this.initialize()) {
        throw new Error('EmailJS not properly configured');
      }
    }

    const {
      inviteeEmail,
      inviteeName,
      inviterName,
      teamName = 'TaskFlow Team',
      role,
      message = '',
      inviterUserId
    } = invitationData;

    // Validate required fields
    if (!inviteeEmail || !inviteeEmail.includes('@')) {
      throw new Error('Valid email address is required');
    }

    // Generate invitation token
    const invitationToken = this.generateInvitationToken(inviteeEmail, inviterUserId, role);
    
    // Create invitation URL - handle both development and production
    const baseUrl = import.meta.env.PROD 
      ? window.location.origin  // Use current domain in production
      : 'http://localhost:3001'; // Use localhost in development
    const invitationUrl = `${baseUrl}/invite/${invitationToken}`;

    // Email template parameters - match EmailJS template exactly
    const templateParams = {
      to_email: inviteeEmail,
      to_name: inviteeName || 'Team Member',
      from_name: inviterName || 'Team Admin',
      team_name: teamName || 'TaskFlow Team',
      role: role || 'member',
      personal_message: message || 'Welcome to our team!',
      invitation_url: invitationUrl,
      app_name: 'TaskFlow',
      expires_in: '7 days'
    };

    try {
      console.log('EmailJS Configuration:');
      console.log('- Service ID:', this.serviceId);
      console.log('- Template ID:', this.templateId);
      console.log('- Public Key:', this.publicKey ? 'Present' : 'Missing');
      console.log('- Environment:', import.meta.env.PROD ? 'Production' : 'Development');
      
      console.log('Sending invitation email to:', inviteeEmail);
      console.log('Template params:', templateParams);
      
      const response = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams
      );

      console.log('Email sent successfully:', response);
      
      // Store invitation locally for tracking
      this.storeInvitationLocally({
        token: invitationToken,
        email: inviteeEmail,
        name: inviteeName,
        role: role,
        inviterUserId: inviterUserId,
        inviterName: inviterName,
        sentAt: new Date().toISOString(),
        status: 'sent',
        message: message
      });

      return {
        success: true,
        token: invitationToken,
        invitationUrl: invitationUrl,
        response: response
      };
    } catch (error) {
      console.error('EmailJS Error Details:', {
        error: error,
        message: error.message,
        status: error.status,
        text: error.text,
        stack: error.stack
      });
      
      // Provide more specific error messages
      let errorMessage = 'Failed to send invitation email';
      
      if (error.status === 400) {
        errorMessage = 'Invalid email parameters or template configuration';
      } else if (error.status === 401) {
        errorMessage = 'Invalid EmailJS credentials';
      } else if (error.status === 403) {
        errorMessage = 'EmailJS service access denied';
      } else if (error.status === 429) {
        errorMessage = 'Too many email requests. Please try again later';
      }
      
      throw new Error(`${errorMessage}: ${error.message}`);
    }
  }

  // Store invitation locally for tracking
  storeInvitationLocally(invitationData) {
    const invitations = JSON.parse(localStorage.getItem('pending_invitations') || '[]');
    invitations.push(invitationData);
    
    // Keep only last 100 invitations
    if (invitations.length > 100) {
      invitations.splice(0, invitations.length - 100);
    }
    
    localStorage.setItem('pending_invitations', JSON.stringify(invitations));
  }

  // Get pending invitations
  getPendingInvitations() {
    return JSON.parse(localStorage.getItem('pending_invitations') || '[]');
  }

  // Update invitation status
  updateInvitationStatus(token, status) {
    const invitations = this.getPendingInvitations();
    const invitation = invitations.find(inv => inv.token === token);
    
    if (invitation) {
      invitation.status = status;
      invitation.updatedAt = new Date().toISOString();
      localStorage.setItem('pending_invitations', JSON.stringify(invitations));
    }
  }

  // Resend invitation
  async resendInvitation(originalToken) {
    const invitations = this.getPendingInvitations();
    const invitation = invitations.find(inv => inv.token === originalToken);
    
    if (!invitation) {
      throw new Error('Original invitation not found');
    }

    // Send new invitation with same details
    return await this.sendInvitationEmail({
      inviteeEmail: invitation.email,
      inviteeName: invitation.name,
      inviterName: invitation.inviterName,
      role: invitation.role,
      message: invitation.message,
      inviterUserId: invitation.inviterUserId
    });
  }

  // Get email template for preview
  getEmailTemplate(invitationData) {
    const {
      inviteeName,
      inviterName,
      teamName = 'TaskFlow Team',
      role,
      message = '',
      invitationUrl = '#'
    } = invitationData;

    return `
      <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">You're Invited!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Join ${teamName} on TaskFlow</p>
        </div>
        
        <div style="background: white; padding: 40px 30px;">
          <p style="font-size: 18px; color: #374151; margin: 0 0 20px 0;">Hi ${inviteeName},</p>
          
          <p style="font-size: 16px; color: #6b7280; line-height: 1.6; margin: 0 0 20px 0;">
            <strong>${inviterName}</strong> has invited you to join <strong>${teamName}</strong> as a <strong>${role}</strong>.
          </p>
          
          ${message ? `
            <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0;">
              <p style="margin: 0; color: #374151; font-style: italic;">"${message}"</p>
            </div>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationUrl}" 
               style="background: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
              Accept Invitation
            </a>
          </div>
          
          <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <h3 style="margin: 0 0 10px 0; color: #374151; font-size: 16px;">As a ${role}, you'll be able to:</h3>
            <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #6b7280;">
              ${this.getRolePermissions(role).map(permission => `<li style="margin: 5px 0;">${permission}</li>`).join('')}
            </ul>
          </div>
          
          <p style="font-size: 14px; color: #9ca3af; margin: 20px 0 0 0; text-align: center;">
            This invitation expires in 7 days. If you have any questions, reply to this email.
          </p>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p style="margin: 0;">TaskFlow - Collaborative Task Management</p>
        </div>
      </div>
    `;
  }

  // Get role permissions for email template
  getRolePermissions(role) {
    const permissions = {
      'admin': [
        'Manage team members and permissions',
        'Create and delete projects',
        'View team analytics and reports',
        'Manage integrations and settings'
      ],
      'manager': [
        'Assign and manage tasks',
        'View team analytics',
        'Invite new team members',
        'Manage project settings'
      ],
      'member': [
        'Create and edit tasks',
        'Collaborate with comments',
        'Update task status',
        'View assigned projects'
      ],
      'viewer': [
        'View tasks and projects',
        'Add comments to tasks',
        'View team activity',
        'Export reports'
      ]
    };
    
    return permissions[role] || permissions['member'];
  }
}

export const emailService = new EmailService();