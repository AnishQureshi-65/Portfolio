package com.portfolio.backend.controller;

import com.portfolio.backend.entity.ContactMessage;
import com.portfolio.backend.service.ContactMessageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final ContactMessageService contactMessageService;

    public ContactController(
            ContactMessageService contactMessageService
    ) {
        this.contactMessageService = contactMessageService;
    }

    @GetMapping
    public ResponseEntity<List<ContactMessage>> getAllMessages() {

        return ResponseEntity.ok(
                contactMessageService.getAllMessages()
        );
    }

    @GetMapping("/unread")
    public ResponseEntity<List<ContactMessage>> getUnreadMessages() {

        return ResponseEntity.ok(
                contactMessageService.getUnreadMessages()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContactMessage> getMessageById(
            @PathVariable Long id
    ) {

        return contactMessageService.getMessageById(id)
                .map(ResponseEntity::ok)
                .orElseGet(
                        () -> ResponseEntity.notFound().build()
                );
    }

    @PostMapping
    public ResponseEntity<ContactMessage> createMessage(
            @RequestBody ContactMessage contactMessage
    ) {

        ContactMessage savedMessage =
                contactMessageService.createMessage(contactMessage);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedMessage);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ContactMessage> markAsRead(
            @PathVariable Long id
    ) {

        return contactMessageService.markAsRead(id)
                .map(ResponseEntity::ok)
                .orElseGet(
                        () -> ResponseEntity.notFound().build()
                );
    }

    @PutMapping("/{id}/unread")
    public ResponseEntity<ContactMessage> markAsUnread(
            @PathVariable Long id
    ) {

        return contactMessageService.markAsUnread(id)
                .map(ResponseEntity::ok)
                .orElseGet(
                        () -> ResponseEntity.notFound().build()
                );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable Long id
    ) {

        boolean deleted =
                contactMessageService.deleteMessage(id);

        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}