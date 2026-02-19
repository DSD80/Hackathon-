package com.economic.controller;

import com.economic.dto.AuthDTOs.ApiResponse;
import com.economic.entity.*;
import com.economic.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired private UserRepository userRepository;
    @Autowired private FamilyMemberRepository memberRepository;
    @Autowired private FinancialProfileRepository financialRepo;

    // Helper: get user from token
    private User getUser(Authentication auth) {
        return userRepository.findByUsername(auth.getName()).orElseThrow();
    }

    // ===== GET full profile =====
    @GetMapping
    public ResponseEntity<?> getProfile(Authentication auth) {
        User user = getUser(auth);
        FinancialProfile fp = financialRepo.findByUserId(user.getId()).orElse(null);
        List<FamilyMember> members = memberRepository.findByUserId(user.getId());

        return ResponseEntity.ok(Map.of(
            "user", Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "phone", user.getPhone(),
                "role", user.getRole(),
                "name", user.getName() != null ? user.getName() : "",
                "city", user.getCity() != null ? user.getCity() : ""
            ),
            "financialProfile", fp != null ? fp : Map.of(),
            "members", members,
            "profileComplete", fp != null && !members.isEmpty()
        ));
    }

    // ===== SAVE household financial details =====
    @PostMapping("/financial")
    public ResponseEntity<?> saveFinancialProfile(@RequestBody FinancialProfile request, Authentication auth) {
        User user = getUser(auth);

        FinancialProfile fp = financialRepo.findByUserId(user.getId())
            .orElse(new FinancialProfile());

        fp.setUser(user);
        fp.setFamilyName(request.getFamilyName());
        fp.setAddress(request.getAddress());
        fp.setCity(request.getCity());
        fp.setState(request.getState());
        fp.setPincode(request.getPincode());
        fp.setTotalSavings(request.getTotalSavings());
        fp.setTotalDebt(request.getTotalDebt());
        fp.setMonthlyExpenses(request.getMonthlyExpenses());
        fp.setRentAmount(request.getRentAmount());
        fp.setSchoolFees(request.getSchoolFees());
        fp.setEmiAmount(request.getEmiAmount());

        financialRepo.save(fp);
        return ResponseEntity.ok(new ApiResponse(true, "Financial profile saved successfully", fp));
    }

    // ===== SAVE/REPLACE all family members =====
    @PostMapping("/members")
    public ResponseEntity<?> saveMembers(@RequestBody List<FamilyMember> members, Authentication auth) {
        User user = getUser(auth);

        // Delete old members
        memberRepository.deleteByUserId(user.getId());

        // Save new
        members.forEach(m -> m.setUser(user));
        memberRepository.saveAll(members);

        return ResponseEntity.ok(new ApiResponse(true, "Members saved successfully", members));
    }

    // ===== GET members =====
    @GetMapping("/members")
    public ResponseEntity<?> getMembers(Authentication auth) {
        User user = getUser(auth);
        return ResponseEntity.ok(memberRepository.findByUserId(user.getId()));
    }
}
