package com.portfolio.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "experiences")
public class Experience {

    // =========================================================
    // PRIMARY KEY
    // =========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================
    // POSITION
    // =========================================================

    @Column(nullable = false)
    private String position;

    // =========================================================
    // COMPANY
    // =========================================================

    @Column(nullable = false)
    private String company;

    // =========================================================
    // EMPLOYMENT TYPE
    // Example: Internship, Full Time, Part Time
    // =========================================================

    @Column(name = "employment_type")
    private String employmentType;

    // =========================================================
    // START DATE
    // Example: Jan 2025
    // =========================================================

    @Column(name = "start_date")
    private String startDate;

    // =========================================================
    // END DATE
    // Example: Jun 2025 / Present
    // =========================================================

    @Column(name = "end_date")
    private String endDate;

    // =========================================================
    // CURRENTLY WORKING
    // =========================================================

    @Column(
            name = "currently_working",
            nullable = false
    )
    private boolean currentlyWorking;

    // =========================================================
    // LOCATION
    // =========================================================

    private String location;

    // =========================================================
    // DESCRIPTION
    // =========================================================

    @Column(columnDefinition = "TEXT")
    private String description;

    // =========================================================
    // TECHNOLOGIES
    // =========================================================

    @Column(columnDefinition = "TEXT")
    private String technologies;

    // =========================================================
    // COMPANY URL
    // =========================================================

    @Column(name = "company_url")
    private String companyUrl;

    // =========================================================
    // DISPLAY ORDER
    // =========================================================

    @Column(name = "display_order")
    private Integer displayOrder;

    // =========================================================
    // FEATURED
    // =========================================================

    @Column(nullable = false)
    private boolean featured;

    // =========================================================
    // DEFAULT CONSTRUCTOR
    // =========================================================

    public Experience() {
    }

    // =========================================================
    // GETTERS AND SETTERS
    // =========================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(String employmentType) {
        this.employmentType = employmentType;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public boolean isCurrentlyWorking() {
        return currentlyWorking;
    }

    public void setCurrentlyWorking(
            boolean currentlyWorking
    ) {
        this.currentlyWorking = currentlyWorking;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(
            String description
    ) {
        this.description = description;
    }

    public String getTechnologies() {
        return technologies;
    }

    public void setTechnologies(
            String technologies
    ) {
        this.technologies = technologies;
    }

    public String getCompanyUrl() {
        return companyUrl;
    }

    public void setCompanyUrl(
            String companyUrl
    ) {
        this.companyUrl = companyUrl;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(
            Integer displayOrder
    ) {
        this.displayOrder = displayOrder;
    }

    public boolean isFeatured() {
        return featured;
    }

    public void setFeatured(
            boolean featured
    ) {
        this.featured = featured;
    }
}