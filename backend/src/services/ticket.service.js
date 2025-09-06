const Ticket = require('../models/ticket.model');
const User = require('../models/user.model');
const PG = require('../models/pg.model');
const EmailService = require('./email.service');

class TicketService {
  // Create a new ticket
  async createTicket(ticketData, userId) {
    try {
      console.log('Creating ticket with data:', ticketData);
      console.log('User ID:', userId);

      // Validate user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get user's PG
      const pg = await PG.findOne({ admin: userId });
      if (!pg) {
        throw new Error('No PG associated with this user');
      }

      // Extract only the required fields for ticket creation
      const ticketFields = {
        title: ticketData.title,
        description: ticketData.description,
        category: ticketData.category,
        priority: ticketData.priority || 'medium',
        user: userId,
        pg: pg._id,
        status: 'open',
        timeline: [{
          action: 'created',
          description: 'Ticket created',
          performedBy: userId
        }]
      };

      const ticket = new Ticket(ticketFields);

      const savedTicket = await ticket.save();
      
      // Populate user and PG details
      await savedTicket.populate('user', 'firstName lastName email');
      await savedTicket.populate('pg', 'name');

      return {
        success: true,
        data: savedTicket,
        message: 'Ticket created successfully'
      };
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw new Error(`Failed to create ticket: ${error.message}`);
    }
  }

  // Get all tickets for admin (only their PG's tickets)
  async getTicketsForAdmin(userId, filters = {}) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get user's PG
      const pg = await PG.findOne({ admin: userId });
      if (!pg) {
        throw new Error('No PG associated with this user');
      }

      const query = { pg: pg._id };

      // Apply filters
      if (filters.status) query.status = filters.status;
      if (filters.priority) query.priority = filters.priority;
      if (filters.category) query.category = filters.category;
      if (filters.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } }
        ];
      }

      const tickets = await Ticket.find(query)
        .populate('user', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName email')
        .populate('pg', 'name')
        .sort({ createdAt: -1 });

      return {
        success: true,
        data: tickets,
        message: 'Tickets retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting tickets for admin:', error);
      throw new Error(`Failed to get tickets: ${error.message}`);
    }
  }

  // Get all tickets for superadmin (all PGs)
  async getAllTickets(filters = {}) {
    try {
      const query = {};

      // Apply filters
      if (filters.status) query.status = filters.status;
      if (filters.priority) query.priority = filters.priority;
      if (filters.category) query.category = filters.category;
      if (filters.assignedTo) query.assignedTo = filters.assignedTo;
      if (filters.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } }
        ];
      }

      const tickets = await Ticket.find(query)
        .populate('user', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName email')
        .populate('pg', 'name')
        .sort({ createdAt: -1 });

      return {
        success: true,
        data: tickets,
        message: 'Tickets retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting all tickets:', error);
      throw new Error(`Failed to get tickets: ${error.message}`);
    }
  }

  // Get tickets assigned to support staff
  async getTicketsForSupport(userId, filters = {}) {
    try {
      const user = await User.findById(userId);
      if (!user || user.role !== 'support') {
        throw new Error('Support user not found');
      }

      // Robust match: handle old records where assignedTo may have been stored as string
      const userIdString = userId.toString();
      const query = {
        $or: [
          { assignedTo: userId },
          { $expr: { $eq: [ { $toString: '$assignedTo' }, userIdString ] } }
        ]
      };

      // Apply filters
      if (filters.status) query.status = filters.status;
      if (filters.priority) query.priority = filters.priority;
      if (filters.category) query.category = filters.category;
      if (filters.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } }
        ];
      }

      let tickets = await Ticket.find(query)
        .populate('user', 'firstName lastName email')
        .populate('pg', 'name')
        .sort({ createdAt: -1 });

      // Fallback: if no results (possible legacy data type mismatch), filter in-memory safely
      if (!tickets || tickets.length === 0) {
        const assignedDocs = await Ticket.find({ assignedTo: { $exists: true, $ne: null } })
          .select('_id assignedTo')
          .lean();

        const matchingIds = assignedDocs
          .filter(doc => {
            const val = doc.assignedTo;
            if (!val) return false;
            try {
              // Handle ObjectId and string cases
              if (typeof val === 'string') return val === userIdString;
              if (val.toString) return val.toString() === userIdString;
              return false;
            } catch (_) {
              return false;
            }
          })
          .map(doc => doc._id);

        if (matchingIds.length > 0) {
          tickets = await Ticket.find({ _id: { $in: matchingIds } })
            .populate('user', 'firstName lastName email')
            .populate('pg', 'name')
            .sort({ createdAt: -1 });
        }
      }

      return {
        success: true,
        data: tickets,
        message: 'Assigned tickets retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting tickets for support:', error);
      throw new Error(`Failed to get assigned tickets: ${error.message}`);
    }
  }

  // Get all tickets for superadmin (all PGs)
  async getAllTickets(filters = {}) {
    try {
      const query = {};

        // Apply filters
      if (filters && filters.status) query.status = filters.status;
      if (filters && filters.priority) query.priority = filters.priority;
      if (filters && filters.category) query.category = filters.category;
      if (filters && filters.pg) query.pg = filters.pg;
      if (filters && filters.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } }
        ];
      }

      const tickets = await Ticket.find(query)
        .populate('user', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName email')
        .populate('pg', 'name')
        .sort({ createdAt: -1 });

      return {
        success: true,
        data: tickets,
        message: 'All tickets retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting all tickets:', error);
      throw new Error(`Failed to get tickets: ${error.message}`);
    }
  }

  // Get ticket by ID
  async getTicketById(ticketId, userId, userRole) {
    try {
      const ticket = await Ticket.findById(ticketId)
        .populate('user', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName email')
        .populate('pg', 'name')
        .populate('comments.author', 'firstName lastName email');

      if (!ticket) {
        throw new Error('Ticket not found');
      }

      // Check permissions
      if (userRole === 'admin') {
        const pg = await PG.findOne({ admin: userId });
        if (!pg || ticket.pg.toString() !== pg._id.toString()) {
          throw new Error('Unauthorized to access this ticket');
        }
      }

      return {
        success: true,
        data: ticket,
        message: 'Ticket retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting ticket:', error);
      throw new Error(`Failed to get ticket: ${error.message}`);
    }
  }

  // Update ticket
  async updateTicket(ticketId, updateData, userId, userRole) {
    try {
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        throw new Error('Ticket not found');
      }

      // Check permissions
      if (userRole === 'admin') {
        const pg = await PG.findOne({ admin: userId });
        if (!pg || ticket.pg.toString() !== pg._id.toString()) {
          throw new Error('Unauthorized to update this ticket');
        }

        // Check if ticket is within 1 hour of creation for editing
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (ticket.createdAt > oneHourAgo && ticket.status !== 'open') {
          throw new Error('Ticket can only be edited within 1 hour of creation and when status is open');
        }
      }

      // Extract only the allowed fields for update
      const allowedFields = {
        title: updateData.title,
        description: updateData.description,
        category: updateData.category,
        priority: updateData.priority
      };

      // Remove undefined fields
      Object.keys(allowedFields).forEach(key => {
        if (allowedFields[key] === undefined) {
          delete allowedFields[key];
        }
      });

      // Update ticket
      const updatedTicket = await Ticket.findByIdAndUpdate(
        ticketId,
        { ...allowedFields, updatedAt: Date.now() },
        { new: true, runValidators: true }
      )
        .populate('user', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName email')
        .populate('pg', 'name')
        .populate('comments.author', 'firstName lastName email');

      // Add timeline entry
      await updatedTicket.addTimelineEntry('updated', 'Ticket updated', userId);

      return {
        success: true,
        data: updatedTicket,
        message: 'Ticket updated successfully'
      };
    } catch (error) {
      console.error('Error updating ticket:', error);
      throw new Error(`Failed to update ticket: ${error.message}`);
    }
  }

  // Add comment to ticket (superadmin, admin, support)
  async addComment(ticketId, message, authorId, authorRole) {
    try {
      if (!message || message.trim().length === 0) {
        throw new Error('Comment message is required');
      }

      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        throw new Error('Ticket not found');
      }

      await ticket.addComment(message, authorId, authorRole);
      await ticket.addTimelineEntry('comment_added', 'New comment added', authorId);

      await ticket.populate('user', 'firstName lastName email');
      await ticket.populate('assignedTo', 'firstName lastName email');
      await ticket.populate('pg', 'name');
      await ticket.populate('comments.author', 'firstName lastName email');

      // Notify ticket creator on staff/superadmin comment
      try {
        if (authorRole !== 'user' && ticket.user?.email) {
          await EmailService.sendEmail({
            to: ticket.user.email,
            subject: `New comment on ticket ${ticket._id.toString().slice(-6)}`,
            html: `<p>A new comment has been added:</p><blockquote>${message}</blockquote>`
          });
        }
      } catch (notifyErr) {
        console.warn('Comment email notify failed:', notifyErr.message);
      }

      return {
        success: true,
        data: ticket,
        message: 'Comment added successfully'
      };
    } catch (error) {
      console.error('Error adding ticket comment:', error);
      throw new Error(`Failed to add comment: ${error.message}`);
    }
  }

  // Delete ticket
  async deleteTicket(ticketId, userId, userRole) {
    try {
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        throw new Error('Ticket not found');
      }

      // Check permissions
      if (userRole === 'admin') {
        const pg = await PG.findOne({ admin: userId });
        if (!pg || ticket.pg.toString() !== pg._id.toString()) {
          throw new Error('Unauthorized to delete this ticket');
        }

        // Check if ticket is within 1 hour of creation
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (ticket.createdAt > oneHourAgo) {
          throw new Error('Ticket can only be deleted within 1 hour of creation');
        }

        // Check if ticket status has been updated
        if (ticket.status !== 'open') {
          throw new Error('Cannot delete ticket that has been updated');
        }
      }

      await Ticket.findByIdAndDelete(ticketId);

      return {
        success: true,
        message: 'Ticket deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting ticket:', error);
      throw new Error(`Failed to delete ticket: ${error.message}`);
    }
  }

  // Assign ticket (superadmin only)
  async assignTicket(ticketId, assignedToId, userId) {
    try {
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        throw new Error('Ticket not found');
      }

      const assignedUser = await User.findById(assignedToId);
      if (!assignedUser || assignedUser.role !== 'support') {
        throw new Error('Support user not found');
      }

      // Ensure proper ObjectId assignment
      ticket.assignedTo = assignedUser._id;
      ticket.status = 'in_progress';
      await ticket.addTimelineEntry('assigned', `Ticket assigned to ${assignedUser.firstName} ${assignedUser.lastName}`, userId);

      const updatedTicket = await ticket.save();
      await updatedTicket.populate('user', 'firstName lastName email');
      await updatedTicket.populate('assignedTo', 'firstName lastName email');
      await updatedTicket.populate('pg', 'name');

      return {
        success: true,
        data: updatedTicket,
        message: 'Ticket assigned successfully'
      };
    } catch (error) {
      console.error('Error assigning ticket:', error);
      throw new Error(`Failed to assign ticket: ${error.message}`);
    }
  }

  // Get all support staff for assignment
  async getSupportStaff() {
    try {
      const supportStaff = await User.find({ 
        role: 'support',
        isActive: true 
      }).select('firstName lastName email _id');

      return {
        success: true,
        data: supportStaff,
        message: 'Support staff retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting support staff:', error);
      throw new Error(`Failed to get support staff: ${error.message}`);
    }
  }

  // Update ticket status (support staff only)
  async updateTicketStatus(ticketId, status, resolution, userId) {
    try {
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        throw new Error('Ticket not found');
      }

      // Check if ticket is assigned to this support user
      if (!ticket.assignedTo) {
        throw new Error('Ticket is not assigned to any support staff');
      }
      if (ticket.assignedTo.toString() !== userId.toString()) {
        throw new Error('You can only update tickets assigned to you');
      }

      const oldStatus = ticket.status;
      ticket.status = status;

      // Add resolution if provided
      if (resolution && (status === 'resolved' || status === 'closed')) {
        ticket.resolution = {
          solution: resolution,
          resolvedAt: new Date(),
          resolvedBy: userId
        };
      }

      // Add timeline entry with feedback
      const timelineDescription = resolution 
        ? `Status changed from ${oldStatus} to ${status}. ${resolution}`
        : `Status changed from ${oldStatus} to ${status}`;

      await ticket.addTimelineEntry('status_updated', timelineDescription, userId);

      const updatedTicket = await ticket.save();
      await updatedTicket.populate('user', 'firstName lastName email');
      await updatedTicket.populate('assignedTo', 'firstName lastName email');
      await updatedTicket.populate('pg', 'name admin');

      // Notify PG admin or ticket creator via email
      try {
        let recipientEmail = updatedTicket.user?.email;
        if (!recipientEmail && updatedTicket.pg?.admin) {
          const pgAdmin = await User.findById(updatedTicket.pg.admin);
          recipientEmail = pgAdmin?.email;
        }
        if (recipientEmail) {
          await EmailService.sendEmail({
            to: recipientEmail,
            subject: `Ticket ${updatedTicket._id.toString().slice(-6)} status updated`,
            html: `<p>Status of ticket <b>${updatedTicket.title}</b> changed to <b>${status}</b>.</p>`
          });
        }
      } catch (notifyErr) {
        console.warn('Status change email notify failed:', notifyErr.message);
      }

      return {
        success: true,
        data: updatedTicket,
        message: 'Ticket status updated successfully'
      };
    } catch (error) {
      console.error('Error updating ticket status:', error);
      throw new Error(`Failed to update ticket status: ${error.message}`);
    }
  }

  // Resolve ticket (superadmin only)
  async resolveTicket(ticketId, resolutionData, userId) {
    try {
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        throw new Error('Ticket not found');
      }

      await ticket.resolve(
        resolutionData.solution,
        userId,
        resolutionData.rating,
        resolutionData.feedback
      );

      const updatedTicket = await ticket.save();
      await updatedTicket.populate('user', 'firstName lastName email');
      await updatedTicket.populate('assignedTo', 'firstName lastName email');
      await updatedTicket.populate('pg', 'name');

      return {
        success: true,
        data: updatedTicket,
        message: 'Ticket resolved successfully'
      };
    } catch (error) {
      console.error('Error resolving ticket:', error);
      throw new Error(`Failed to resolve ticket: ${error.message}`);
    }
  }

  // Close ticket (superadmin only)
  async closeTicket(ticketId, userId) {
    try {
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        throw new Error('Ticket not found');
      }

      await ticket.close(userId);

      const updatedTicket = await ticket.save();
      await updatedTicket.populate('user', 'firstName lastName email');
      await updatedTicket.populate('assignedTo', 'firstName lastName email');
      await updatedTicket.populate('pg', 'name');

      return {
        success: true,
        data: updatedTicket,
        message: 'Ticket closed successfully'
      };
    } catch (error) {
      console.error('Error closing ticket:', error);
      throw new Error(`Failed to close ticket: ${error.message}`);
    }
  }

  // Get ticket statistics
  async getTicketStats(userId = null, userRole = null) {
    try {
      let match = {};
      
      if (userRole === 'admin') {
        const pg = await PG.findOne({ admin: userId });
        if (pg) {
          match.pg = pg._id;
        }
      } else if (userRole === 'support') {
        // Limit stats to tickets assigned to this support user
        match.assignedTo = userId;
      }

      const stats = await Ticket.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const totalTickets = await Ticket.countDocuments(match);
      const openTickets = await Ticket.countDocuments({ ...match, status: 'open' });
      const inProgressTickets = await Ticket.countDocuments({ ...match, status: 'in_progress' });
      const resolvedTickets = await Ticket.countDocuments({ ...match, status: 'resolved' });
      const closedTickets = await Ticket.countDocuments({ ...match, status: 'closed' });

      return {
        success: true,
        data: {
          total: totalTickets,
          open: openTickets,
          inProgress: inProgressTickets,
          resolved: resolvedTickets,
          closed: closedTickets,
          breakdown: stats
        },
        message: 'Ticket statistics retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting ticket stats:', error);
      throw new Error(`Failed to get ticket statistics: ${error.message}`);
    }
  }

  // Get ticket analytics
  async getTicketAnalytics(userId = null, userRole = null, timeRange = 'week') {
    try {
      let match = {};
      
      if (userRole === 'admin') {
        const pg = await PG.findOne({ admin: userId });
        if (pg) {
          match.pg = pg._id;
        }
      }

      // Calculate date range based on timeRange
      const now = new Date();
      let startDate;
      
      switch (timeRange) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'quarter':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      // Add date filter
      match.createdAt = { $gte: startDate };

      // Get overview statistics
      const totalTickets = await Ticket.countDocuments(match);
      const openTickets = await Ticket.countDocuments({ ...match, status: 'open' });
      const inProgressTickets = await Ticket.countDocuments({ ...match, status: 'in_progress' });
      const resolvedTickets = await Ticket.countDocuments({ ...match, status: 'resolved' });
      const closedTickets = await Ticket.countDocuments({ ...match, status: 'closed' });

      // Calculate average response and resolution times
      const resolvedTicketsData = await Ticket.find({ ...match, status: 'resolved' })
        .populate('timeline')
        .lean();

      let totalResponseTime = 0;
      let totalResolutionTime = 0;
      let responseTimeCount = 0;
      let resolutionTimeCount = 0;

      resolvedTicketsData.forEach(ticket => {
        if (ticket.timeline && ticket.timeline.length > 0) {
          const createdTime = new Date(ticket.createdAt);
          const firstResponse = ticket.timeline.find(t => t.action === 'in_progress');
          const resolvedTime = ticket.timeline.find(t => t.action === 'resolved');

          if (firstResponse) {
            const responseTime = new Date(firstResponse.timestamp) - createdTime;
            totalResponseTime += responseTime;
            responseTimeCount++;
          }

          if (resolvedTime) {
            const resolutionTime = new Date(resolvedTime.timestamp) - createdTime;
            totalResolutionTime += resolutionTime;
            resolutionTimeCount++;
          }
        }
      });

      const avgResponseTime = responseTimeCount > 0 ? (totalResponseTime / responseTimeCount / (1000 * 60 * 60)).toFixed(1) : 0;
      const avgResolutionTime = resolutionTimeCount > 0 ? (totalResolutionTime / resolutionTimeCount / (1000 * 60 * 60 * 24)).toFixed(1) : 0;

      // Get daily trends for the last 7 days
      const dailyTrends = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

        const dayTickets = await Ticket.countDocuments({
          ...match,
          createdAt: { $gte: dayStart, $lt: dayEnd }
        });

        const dayResolved = await Ticket.countDocuments({
          ...match,
          status: 'resolved',
          'timeline.action': 'resolved',
          'timeline.timestamp': { $gte: dayStart, $lt: dayEnd }
        });

        dailyTrends.push({
          date: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
          tickets: dayTickets,
          resolved: dayResolved
        });
      }

      // Get category breakdown
      const categoryStats = await Ticket.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      const categories = categoryStats.map(stat => {
        // Calculate real resolution time for this category
        const categoryTickets = resolvedTicketsData.filter(ticket => ticket.category === stat._id);
        let totalResolutionTime = 0;
        let resolutionCount = 0;
        
        categoryTickets.forEach(ticket => {
          if (ticket.timeline && ticket.timeline.length > 0) {
            const createdTime = new Date(ticket.createdAt);
            const resolvedTime = ticket.timeline.find(t => t.action === 'resolved');
            
            if (resolvedTime) {
              const resolutionTime = new Date(resolvedTime.timestamp) - createdTime;
              totalResolutionTime += resolutionTime;
              resolutionCount++;
            }
          }
        });
        
        const avgResolutionDays = resolutionCount > 0 ? (totalResolutionTime / resolutionCount / (1000 * 60 * 60 * 24)).toFixed(1) : 0;
        
        return {
          name: stat._id,
          count: stat.count,
          percentage: totalTickets > 0 ? ((stat.count / totalTickets) * 100).toFixed(1) : 0,
          avgResolution: `${avgResolutionDays} days`
        };
      });

      // Get top issues (categories with most tickets)
      const topIssues = categories.slice(0, 5).map(category => ({
        issue: category.name,
        count: category.count,
        trend: Math.random() > 0.5 ? 'up' : 'down' // Mock trend for now
      }));

      // Mock staff performance data
      const staffPerformance = [
        { name: 'John Doe', tickets: 45, avgResolution: '3.2 hours', satisfaction: 4.5 },
        { name: 'Jane Smith', tickets: 38, avgResolution: '2.8 hours', satisfaction: 4.3 },
        { name: 'Mike Johnson', tickets: 32, avgResolution: '4.1 hours', satisfaction: 4.1 },
        { name: 'Sarah Wilson', tickets: 28, avgResolution: '3.5 hours', satisfaction: 4.4 },
        { name: 'David Brown', tickets: 25, avgResolution: '3.8 hours', satisfaction: 4.2 }
      ];

      return {
        success: true,
        data: {
          overview: {
            totalTickets,
            openTickets,
            inProgressTickets: inProgressTickets,
            resolvedTickets,
            closedTickets,
            avgResponseTime: `${avgResponseTime} hours`,
            avgResolutionTime: `${avgResolutionTime} days`,
            satisfactionScore: 4.2 // Mock satisfaction score
          },
          trends: {
            daily: dailyTrends,
            weekly: [], // Could be implemented similarly
            monthly: []  // Could be implemented similarly
          },
          categories,
          topIssues,
          staffPerformance
        },
        message: 'Ticket analytics retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting ticket analytics:', error);
      throw new Error(`Failed to get ticket analytics: ${error.message}`);
    }
  }

  // Get superadmin analytics with real-time data
  async getSuperadminAnalytics(timeRange = 'week', filters = {}) {
    try {
      let match = {};

      // Apply filters
      if (filters.pg && filters.pg !== 'all') {
        const pg = await PG.findOne({ name: { $regex: filters.pg, $options: 'i' } });
        if (pg) {
          match.pg = pg._id;
        }
      }

      if (filters.category && filters.category !== 'all') {
        match.category = filters.category;
      }

      if (filters.status && filters.status !== 'all') {
        match.status = filters.status;
      }

      // Calculate date range based on timeRange
      const now = new Date();
      let startDate;
      
      switch (timeRange) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'quarter':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      // Add date filter
      match.createdAt = { $gte: startDate };

      // Get comprehensive overview statistics
      const totalTickets = await Ticket.countDocuments(match);
      const openTickets = await Ticket.countDocuments({ ...match, status: 'open' });
      const inProgressTickets = await Ticket.countDocuments({ ...match, status: 'in_progress' });
      const resolvedTickets = await Ticket.countDocuments({ ...match, status: 'resolved' });
      const closedTickets = await Ticket.countDocuments({ ...match, status: 'closed' });

      // Get PG and resident statistics
      const activePGs = await PG.countDocuments({ isActive: true });
      const totalResidents = await User.countDocuments({ role: 'user', isActive: true });

      // Calculate revenue (mock calculation based on resolved tickets)
      const totalRevenue = resolvedTickets * 1000; // Mock revenue calculation

      // Calculate average response and resolution times
      const resolvedTicketsData = await Ticket.find({ ...match, status: 'resolved' })
        .populate('timeline')
        .lean();

      let totalResponseTime = 0;
      let totalResolutionTime = 0;
      let responseTimeCount = 0;
      let resolutionTimeCount = 0;

      resolvedTicketsData.forEach(ticket => {
        if (ticket.timeline && ticket.timeline.length > 0) {
          const createdTime = new Date(ticket.createdAt);
          const firstResponse = ticket.timeline.find(t => t.action === 'in_progress');
          const resolvedTime = ticket.timeline.find(t => t.action === 'resolved');

          if (firstResponse) {
            const responseTime = new Date(firstResponse.timestamp) - createdTime;
            totalResponseTime += responseTime;
            responseTimeCount++;
          }

          if (resolvedTime) {
            const resolutionTime = new Date(resolvedTime.timestamp) - createdTime;
            totalResolutionTime += resolutionTime;
            resolutionTimeCount++;
          }
        }
      });

      const avgResponseTime = responseTimeCount > 0 ? (totalResponseTime / responseTimeCount / (1000 * 60 * 60)).toFixed(1) : 0;
      const avgResolutionTime = resolutionTimeCount > 0 ? (totalResolutionTime / resolutionTimeCount / (1000 * 60 * 60 * 24)).toFixed(1) : 0;

      // Get daily trends with revenue
      const dailyTrends = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

        const dayTickets = await Ticket.countDocuments({
          ...match,
          createdAt: { $gte: dayStart, $lt: dayEnd }
        });

        const dayResolved = await Ticket.countDocuments({
          ...match,
          status: 'resolved',
          'timeline.action': 'resolved',
          'timeline.timestamp': { $gte: dayStart, $lt: dayEnd }
        });

        const dayRevenue = dayResolved * 1000; // Mock revenue calculation

        dailyTrends.push({
          date: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
          tickets: dayTickets,
          resolved: dayResolved,
          revenue: dayRevenue
        });
      }

      // Get category breakdown with resolution times
      const categoryStats = await Ticket.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      const categories = categoryStats.map(stat => ({
        name: stat._id,
        count: stat.count,
        percentage: totalTickets > 0 ? ((stat.count / totalTickets) * 100).toFixed(1) : 0,
        avgResolution: `${(Math.random() * 2 + 0.5).toFixed(1)} days` // Mock resolution time
      }));

      // Get top issues with resolution times
      const topIssues = categories.slice(0, 5).map(category => {
        // Calculate real resolution time for this category
        const categoryTickets = resolvedTicketsData.filter(ticket => ticket.category === category.name);
        let totalResolutionTime = 0;
        let resolutionCount = 0;
        
        categoryTickets.forEach(ticket => {
          if (ticket.timeline && ticket.timeline.length > 0) {
            const createdTime = new Date(ticket.createdAt);
            const resolvedTime = ticket.timeline.find(t => t.action === 'resolved');
            
            if (resolvedTime) {
              const resolutionTime = new Date(resolvedTime.timestamp) - createdTime;
              totalResolutionTime += resolutionTime;
              resolutionCount++;
            }
          }
        });
        
        const avgResolutionHours = resolutionCount > 0 ? (totalResolutionTime / resolutionCount / (1000 * 60 * 60)).toFixed(1) : 0;
        
        return {
          issue: category.name,
          count: category.count,
          trend: category.count > (totalTickets / categories.length) ? 'up' : 'down',
          avgResolution: `${avgResolutionHours} hours`
        };
      });

      // Real staff performance data
      const staffPerformanceData = await Ticket.aggregate([
        { $match: { ...match, status: 'resolved' } },
        {
          $lookup: {
            from: 'users',
            localField: 'assignedTo',
            foreignField: '_id',
            as: 'staffData'
          }
        },
        {
          $group: {
            _id: '$assignedTo',
            tickets: { $sum: 1 },
            staffName: { $first: '$staffData.firstName' },
            staffLastName: { $first: '$staffData.lastName' }
          }
        },
        { $sort: { tickets: -1 } },
        { $limit: 5 }
      ]);

      const staffPerformance = staffPerformanceData.map(staff => {
        // Calculate real resolution time for this staff member
        const staffTickets = resolvedTicketsData.filter(ticket => 
          ticket.assignedTo && ticket.assignedTo.toString() === staff._id.toString()
        );
        
        let totalResolutionTime = 0;
        let resolutionCount = 0;
        
        staffTickets.forEach(ticket => {
          if (ticket.timeline && ticket.timeline.length > 0) {
            const createdTime = new Date(ticket.createdAt);
            const resolvedTime = ticket.timeline.find(t => t.action === 'resolved');
            
            if (resolvedTime) {
              const resolutionTime = new Date(resolvedTime.timestamp) - createdTime;
              totalResolutionTime += resolutionTime;
              resolutionCount++;
            }
          }
        });
        
        const avgResolutionHours = resolutionCount > 0 ? (totalResolutionTime / resolutionCount / (1000 * 60 * 60)).toFixed(1) : 0;
        const efficiency = resolutionCount > 0 ? Math.min(100, Math.max(80, 100 - (avgResolutionHours - 2) * 10)) : 85;
        
        return {
          name: `${staff.staffName || 'Unknown'} ${staff.staffLastName || ''}`,
          tickets: staff.tickets,
          avgResolution: `${avgResolutionHours} hours`,
          satisfaction: (Math.random() * 0.5 + 4.3).toFixed(1), // Mock satisfaction for now
          efficiency: Math.round(efficiency)
        };
      });

      // Enhanced PG performance data with real resolution times
      const pgPerformanceData = pgPerformance.map(pg => {
        const pgTickets = resolvedTicketsData.filter(ticket => 
          ticket.pg && ticket.pg.toString() === pg._id.toString()
        );
        
        let totalResolutionTime = 0;
        let resolutionCount = 0;
        
        pgTickets.forEach(ticket => {
          if (ticket.timeline && ticket.timeline.length > 0) {
            const createdTime = new Date(ticket.createdAt);
            const resolvedTime = ticket.timeline.find(t => t.action === 'resolved');
            
            if (resolvedTime) {
              const resolutionTime = new Date(resolvedTime.timestamp) - createdTime;
              totalResolutionTime += resolutionTime;
              resolutionCount++;
            }
          }
        });
        
        const avgResolutionDays = resolutionCount > 0 ? (totalResolutionTime / resolutionCount / (1000 * 60 * 60 * 24)).toFixed(1) : 0;
        
        return {
          name: pg.pgName?.[0] || 'Unknown PG',
          tickets: pg.tickets,
          avgResolution: `${avgResolutionDays} days`,
          satisfaction: (Math.random() * 0.5 + 4.3).toFixed(1), // Mock satisfaction for now
          revenue: pg.tickets * 1000 // Mock revenue calculation
        };
      });

      // Real-time statistics
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const ticketsCreatedToday = await Ticket.countDocuments({
        ...match,
        createdAt: { $gte: today, $lt: tomorrow }
      });

      const ticketsResolvedToday = await Ticket.countDocuments({
        ...match,
        status: 'resolved',
        'timeline.action': 'resolved',
        'timeline.timestamp': { $gte: today, $lt: tomorrow }
      });

      const activeSupportStaff = await User.countDocuments({
        role: 'support',
        isActive: true
      });

      return {
        success: true,
        data: {
          overview: {
            totalTickets,
            openTickets,
            inProgressTickets,
            resolvedTickets,
            closedTickets,
            avgResponseTime: `${avgResponseTime} hours`,
            avgResolutionTime: `${avgResolutionTime} days`,
            satisfactionScore: 4.6,
            totalRevenue,
            activePGs,
            totalResidents
          },
          trends: {
            daily: dailyTrends,
            weekly: [],
            monthly: []
          },
          categories,
          topIssues,
          staffPerformance,
          pgPerformance: pgPerformanceData,
          realTimeStats: {
            ticketsCreatedToday,
            ticketsResolvedToday,
            activeSupportStaff,
            avgWaitTime: '15 minutes' // Mock wait time
          }
        },
        message: 'Superadmin analytics retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting superadmin analytics:', error);
      throw new Error(`Failed to get superadmin analytics: ${error.message}`);
    }
  }

  // Get ticket categories
  getTicketCategories() {
    return [
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'billing', label: 'Billing' },
      { value: 'complaint', label: 'Complaint' },
      { value: 'suggestion', label: 'Suggestion' },
      { value: 'emergency', label: 'Emergency' },
      { value: 'other', label: 'Other' }
    ];
  }

  // Get priority levels
  getPriorityLevels() {
    return [
      { value: 'low', label: 'Low', color: 'green' },
      { value: 'medium', label: 'Medium', color: 'yellow' },
      { value: 'high', label: 'High', color: 'orange' },
      { value: 'urgent', label: 'Urgent', color: 'red' }
    ];
  }

  // Get status options
  getStatusOptions() {
    return [
      { value: 'open', label: 'Open', color: 'blue' },
      { value: 'in_progress', label: 'In Progress', color: 'yellow' },
      { value: 'resolved', label: 'Resolved', color: 'green' },
      { value: 'closed', label: 'Closed', color: 'gray' },
      { value: 'cancelled', label: 'Cancelled', color: 'red' }
    ];
  }
}

module.exports = new TicketService(); 