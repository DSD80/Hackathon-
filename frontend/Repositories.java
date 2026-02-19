// ====================== UserRepository.java ======================
package com.economic.repository;

import com.economic.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}

// ====================== FamilyMemberRepository.java ======================
package com.economic.repository;

import com.economic.entity.FamilyMember;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FamilyMemberRepository extends JpaRepository<FamilyMember, Long> {
    List<FamilyMember> findByUserId(Long userId);
    List<FamilyMember> findByUserIdAndIsEarnerTrue(Long userId);
    void deleteByUserId(Long userId);
}

// ====================== FinancialProfileRepository.java ======================
package com.economic.repository;

import com.economic.entity.FinancialProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FinancialProfileRepository extends JpaRepository<FinancialProfile, Long> {
    Optional<FinancialProfile> findByUserId(Long userId);
}

// ====================== ResilienceTrackerRepository.java ======================
package com.economic.repository;

import com.economic.entity.ResilienceTracker;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ResilienceTrackerRepository extends JpaRepository<ResilienceTracker, Long> {
    List<ResilienceTracker> findByUserIdOrderByMonthAsc(Long userId);
    Optional<ResilienceTracker> findByUserIdAndMonth(Long userId, LocalDate month);
}
