import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertBookingSchema,
  insertReviewSchema,
  insertRelativeSchema,
  insertEmergencyContactSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile
  app.put('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updateData = req.body;
      
      const user = await storage.upsertUser({
        id: userId,
        ...updateData,
      });
      
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Service providers routes
  app.get('/api/service-providers', async (req, res) => {
    try {
      const { serviceType, location } = req.query;
      const providers = await storage.getServiceProviders(
        serviceType as string,
        location as string
      );
      res.json(providers);
    } catch (error) {
      console.error("Error fetching service providers:", error);
      res.status(500).json({ message: "Failed to fetch service providers" });
    }
  });

  app.get('/api/service-providers/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid service provider ID" });
      }
      
      const provider = await storage.getServiceProviderById(id);
      
      if (!provider) {
        return res.status(404).json({ message: "Service provider not found" });
      }
      
      res.json(provider);
    } catch (error) {
      console.error("Error fetching service provider:", error);
      res.status(500).json({ message: "Failed to fetch service provider" });
    }
  });

  app.get('/api/service-providers/:id/reviews', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const reviews = await storage.getProviderReviews(id);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Booking routes
  app.post('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookingData = insertBookingSchema.parse(req.body);
      
      // Check if booking is by relative
      if (bookingData.bookedByRelative && bookingData.relativeId) {
        const hasAccess = await storage.getRelativeAccess(userId, bookingData.relativeId);
        if (!hasAccess) {
          return res.status(403).json({ message: "Relative does not have booking access" });
        }
      }
      
      const booking = await storage.createBooking({
        ...bookingData,
        userId,
      });

      // Send mock SMS notifications
      const user = await storage.getUser(userId);
      if (user?.phone) {
        await storage.sendSMSNotification(
          user.phone,
          `आपकी बुकिंग पुष्टि हो गई है। बुकिंग ID: ${booking.id}. धन्यवाद - आश्रय`
        );
      }

      // Notify service provider (mock)
      const provider = await storage.getServiceProviderById(booking.providerId);
      if (provider?.phone) {
        await storage.sendSMSNotification(
          provider.phone,
          `नई बुकिंग मिली है। बुकिंग ID: ${booking.id}. कृपया तैयार रहें।`
        );
      }

      const fullBooking = await storage.getBookingById(booking.id);
      res.json(fullBooking);
    } catch (error) {
      console.error("Error creating booking:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.get('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookings = await storage.getUserBookings(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get('/api/bookings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getBookingById(id);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Check if user owns this booking
      const userId = req.user.claims.sub;
      if (booking.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  // Review routes
  app.post('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId,
      });
      
      const review = await storage.createReview(reviewData);
      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Relatives routes
  app.post('/api/relatives', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const relativeData = insertRelativeSchema.parse({
        ...req.body,
        seniorCitizenId: userId,
      });
      
      const relative = await storage.linkRelative(relativeData);
      res.json(relative);
    } catch (error) {
      console.error("Error linking relative:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid relative data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to link relative" });
    }
  });

  app.get('/api/relatives', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const relatives = await storage.getUserRelatives(userId);
      res.json(relatives);
    } catch (error) {
      console.error("Error fetching relatives:", error);
      res.status(500).json({ message: "Failed to fetch relatives" });
    }
  });

  // Emergency contact routes
  app.post('/api/emergency-contacts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contactData = insertEmergencyContactSchema.parse({
        ...req.body,
        userId,
      });
      
      const contact = await storage.createEmergencyContact(contactData);
      res.json(contact);
    } catch (error) {
      console.error("Error creating emergency contact:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create emergency contact" });
    }
  });

  app.get('/api/emergency-contacts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contacts = await storage.getUserEmergencyContacts(userId);
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching emergency contacts:", error);
      res.status(500).json({ message: "Failed to fetch emergency contacts" });
    }
  });

  // Emergency SOS route
  app.post('/api/emergency/sos', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const emergencyContacts = await storage.getUserEmergencyContacts(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Send SOS messages to all emergency contacts
      const smsPromises = emergencyContacts.map(contact =>
        storage.sendSMSNotification(
          contact.phone,
          `🚨 आपातकाल की स्थिति! ${user.firstName} ${user.lastName} को तुरंत सहायता की आवश्यकता है। कृपया तत्काल संपर्क करें। - आश्रय`
        )
      );

      const results = await Promise.all(smsPromises);
      const successCount = results.filter(Boolean).length;

      res.json({
        message: "SOS alert sent",
        contactsNotified: successCount,
        totalContacts: emergencyContacts.length,
      });
    } catch (error) {
      console.error("Error sending SOS:", error);
      res.status(500).json({ message: "Failed to send SOS alert" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
