package com.economic.controller;

import com.economic.entity.*;
import com.economic.repository.*;
import com.economic.service.FormulaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

// ============================================================
//   Economic Stability Controller
// ============================================================
@RestController
@RequestMapping("/api/economic-score")
class EconomicStabilityController {

    @Autowired private UserRepository userRepository;
    @Autowired private FormulaService formulaService;

    @GetMapping
    public ResponseEntity<?> getScore(Authentication auth) {
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();
        try {
            Map<String, Object> result = formulaService.calculateEFS(user.getId());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Please complete your profile first. " + e.getMessage()
            ));
        }
    }
}


// ============================================================
//   Shock Simulation Controller
// ============================================================
@RestController
@RequestMapping("/api/shock-simulate")
class ShockSimulationController {

    @Autowired private UserRepository userRepository;
    @Autowired private FormulaService formulaService;

    @PostMapping
    public ResponseEntity<?> simulate(@RequestBody Map<String, Object> request, Authentication auth) {
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();
        try {
            String shockType = (String) request.get("shockType");
            double shockValue = request.containsKey("shockValue")
                ? ((Number) request.get("shockValue")).doubleValue() : 0;

            Map<String, Object> result = formulaService.simulateShock(user.getId(), shockType, shockValue);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false, "message", e.getMessage()
            ));
        }
    }
}


// ============================================================
//   Opportunity Mode Controller
// ============================================================
@RestController
@RequestMapping("/api/opportunity-simulate")
class OpportunityController {

    @Autowired private UserRepository userRepository;
    @Autowired private FormulaService formulaService;

    @PostMapping
    public ResponseEntity<?> simulate(@RequestBody Map<String, Object> request, Authentication auth) {
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();
        try {
            double investmentCost = ((Number) request.get("investmentCost")).doubleValue();
            double expectedIncomeIncrease = ((Number) request.get("expectedIncomeIncrease")).doubleValue();
            double successProbability = ((Number) request.get("successProbability")).doubleValue();

            Map<String, Object> result = formulaService.simulateOpportunity(
                user.getId(), investmentCost, expectedIncomeIncrease, successProbability);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false, "message", e.getMessage()
            ));
        }
    }
}


// ============================================================
//   Resilience Tracker Controller
// ============================================================
@RestController
@RequestMapping("/api/resilience-tracker")
class ResilienceTrackerController {

    @Autowired private UserRepository userRepository;
    @Autowired private ResilienceTrackerRepository trackerRepository;
    @Autowired private FormulaService formulaService;

    // Save monthly entry
    @PostMapping
    public ResponseEntity<?> saveMonthlyEntry(@RequestBody ResilienceTracker request, Authentication auth) {
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();

        LocalDate month = request.getMonth() != null ? request.getMonth() : LocalDate.now().withDayOfMonth(1);

        // Get previous month for delta calculation
        LocalDate prevMonth = month.minusMonths(1);
        Optional<ResilienceTracker> prev = trackerRepository.findByUserIdAndMonth(user.getId(), prevMonth);

        double deltaSavings = prev.map(p -> request.getTotalSavings() - p.getTotalSavings()).orElse(0.0);
        double deltaDebt = prev.map(p -> p.getTotalDebt() - request.getTotalDebt()).orElse(0.0);

        double score = formulaService.calculateResilienceScore(
            request.getTotalSavings(),
            request.getTotalExpenses(),
            request.getIncomeSourceCount() != null ? request.getIncomeSourceCount() : 1,
            request.getSkillCount() != null ? request.getSkillCount() : 0,
            deltaSavings,
            deltaDebt
        );

        ResilienceTracker tracker = trackerRepository.findByUserIdAndMonth(user.getId(), month)
            .orElse(new ResilienceTracker());

        tracker.setUser(user);
        tracker.setMonth(month);
        tracker.setTotalIncome(request.getTotalIncome());
        tracker.setTotalExpenses(request.getTotalExpenses());
        tracker.setTotalSavings(request.getTotalSavings());
        tracker.setTotalDebt(request.getTotalDebt());
        tracker.setIncomeSourceCount(request.getIncomeSourceCount());
        tracker.setSkillCount(request.getSkillCount());
        tracker.setDependentCount(request.getDependentCount());
        tracker.setEarnerCount(request.getEarnerCount());
        tracker.setEmergencyFundRatio(request.getTotalExpenses() > 0
            ? request.getTotalSavings() / request.getTotalExpenses() : 0);
        tracker.setResilienceScore(score);

        trackerRepository.save(tracker);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "resilienceScore", Math.round(score * 10.0) / 10.0,
            "message", "Monthly data saved successfully"
        ));
    }

    // Get all history
    @GetMapping("/history")
    public ResponseEntity<?> getHistory(Authentication auth) {
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();
        List<ResilienceTracker> history = trackerRepository.findByUserIdOrderByMonthAsc(user.getId());
        return ResponseEntity.ok(history);
    }
}
