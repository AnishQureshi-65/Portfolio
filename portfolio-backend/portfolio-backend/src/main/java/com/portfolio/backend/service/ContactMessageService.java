package com.portfolio.backend.service;

import com.portfolio.backend.entity.ContactMessage;
import com.portfolio.backend.repository.ContactMessageRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ContactMessageService {

    private final ContactMessageRepository contactMessageRepository;

    public ContactMessageService(
            ContactMessageRepository contactMessageRepository
    ) {
        this.contactMessageRepository = contactMessageRepository;
    }

    public List<ContactMessage> getAllMessages() {
        return contactMessageRepository.findAllByOrderByIdDesc();
    }

    public List<ContactMessage> getUnreadMessages() {
        return contactMessageRepository.findByReadFalseOrderByIdDesc();
    }

    public Optional<ContactMessage> getMessageById(Long id) {
        return contactMessageRepository.findById(id);
    }

    public ContactMessage createMessage(ContactMessage contactMessage) {

        contactMessage.setId(null);

        if (contactMessage.getCreatedAt() == null ||
                contactMessage.getCreatedAt().isBlank()) {

            contactMessage.setCreatedAt(
                    LocalDateTime.now().toString()
            );
        }

        contactMessage.setRead(false);

        return contactMessageRepository.save(contactMessage);
    }

    public Optional<ContactMessage> markAsRead(Long id) {

        return contactMessageRepository.findById(id)
                .map(message -> {

                    message.setRead(true);

                    return contactMessageRepository.save(message);
                });
    }

    public Optional<ContactMessage> markAsUnread(Long id) {

        return contactMessageRepository.findById(id)
                .map(message -> {

                    message.setRead(false);

                    return contactMessageRepository.save(message);
                });
    }

    public boolean deleteMessage(Long id) {

        if (!contactMessageRepository.existsById(id)) {
            return false;
        }

        contactMessageRepository.deleteById(id);

        return true;
    }
}