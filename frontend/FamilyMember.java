package com.economic.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "family_members")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FamilyMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String fullName;
    private Integer age;
    private String gender;
    private String educationLevel;
    private Boolean isEarner;

    // Income details (for earners only)
    private String incomeType; // DAILY_WAGE, SALARY, BUSINESS, SELF_EMPLOYED
    private Double monthlyIncome;
    private String incomeStability; // STABLE, SEMI_STABLE, SEASONAL

    // Skills (comma-separated)
    private String skills;
}
