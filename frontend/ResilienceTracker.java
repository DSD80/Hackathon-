package com.economic.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "resilience_tracker")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResilienceTracker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private LocalDate month; // e.g., 2024-01-01 represents Jan 2024

    private Double totalIncome;
    private Double totalExpenses;
    private Double totalSavings;
    private Double totalDebt;
    private Integer incomeSourceCount;
    private Integer skillCount;
    private Integer dependentCount;
    private Integer earnerCount;

    // Calculated scores
    private Double emergencyFundRatio;
    private Double debtBurdenRatio;
    private Double incomeDiversityScore;
    private Double skillScore;
    private Double resilienceScore;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }
}
