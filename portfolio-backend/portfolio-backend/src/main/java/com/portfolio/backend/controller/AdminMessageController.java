package com.portfolio.backend.controller;

import com.portfolio.backend.entity.ContactMessage;
import com.portfolio.backend.service.ContactMessageService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/messages")
public class AdminMessageController {

    private final ContactMessageService contactMessageService;

    public AdminMessageController(
            ContactMessageService contactMessageService
    ) {
        this.contactMessageService = contactMessageService;
    }


    // =========================================================
    // GET ALL MESSAGES
    // =========================================================

    /**
     * GET /api/admin/messages
     *
     * Returns all contact messages.
     *
     * ADMIN ONLY
     */
    @GetMapping
    public ResponseEntity<List<ContactMessage>> getAllMessages() {

        return ResponseEntity.ok(
                contactMessageService.getAllMessages()
        );
    }


    // =========================================================
    // GET UNREAD MESSAGES
    // =========================================================

    /**
     * GET /api/admin/messages/unread
     *
     * Returns only unread messages.
     *
     * ADMIN ONLY
     */
    @GetMapping("/unread")
    public ResponseEntity<List<ContactMessage>> getUnreadMessages() {

        return ResponseEntity.ok(
                contactMessageService.getUnreadMessages()
        );
    }


    // =========================================================
    // GET MESSAGE BY ID
    // =========================================================

    /**
     * GET /api/admin/messages/{id}
     *
     * Returns a single message.
     *
     * ADMIN ONLY
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getMessageById(
            @PathVariable Long id
    ) {

        return contactMessageService
                .getMessageById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }


    // =========================================================
    // MARK MESSAGE AS READ
    // =========================================================

    /**
     * PUT /api/admin/messages/{id}/read
     *
     * Marks message as read.
     *
     * ADMIN ONLY
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable Long id
    ) {

        return contactMessageService
                .markAsRead(id)
                .map(message ->
                        ResponseEntity.ok(message)
                )
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }


    // =========================================================
    // MARK MESSAGE AS UNREAD
    // =========================================================

    /**
     * PUT /api/admin/messages/{id}/unread
     *
     * Marks message as unread.
     *
     * ADMIN ONLY
     */
    @PutMapping("/{id}/unread")
    public ResponseEntity<?> markAsUnread(
            @PathVariable Long id
    ) {

        return contactMessageService
                .markAsUnread(id)
                .map(message ->
                        ResponseEntity.ok(message)
                )
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }


    // =========================================================
    // DELETE MESSAGE
    // =========================================================

    /**
     * DELETE /api/admin/messages/{id}
     *
     * Deletes a contact message.
     *
     * ADMIN ONLY
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMessage(
            @PathVariable Long id
    ) {

        boolean deleted =
                contactMessageService.deleteMessage(id);

        if (!deleted) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        return ResponseEntity.ok(
                java.util.Map.of(
                        "message",
                        "Contact message deleted successfully"
                )
        );
    }
}