package com.economic.service;

import com.economic.entity.*;
import com.economic.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class FormulaService {

    @Autowired private FamilyMemberRepository memberRepository;
    @Autowired private FinancialProfileRepository financialRepo;

    // ==========================================
    //   1. INCOME STABILITY VALUE (numeric)
    // ==========================================
    public double getStabilityValue(String stability) {
        if (stability == null) return 0.4;
        return switch (stability.toUpperCase()) {
            case "STABLE" -> 0.9;
            case "SEMI_STABLE" -> 0.7;
            default -> 0.4; // SEASONAL / DAILY_WAGE
        };
    }

    // ==========================================
    //   2. ECONOMIC FLEXIBILITY SCORE (EFS)
    // ==========================================
    public Map<String, Object> calculateEFS(Long userId) {
        FinancialProfile fp = financialRepo.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Financial profile not found"));
        List<FamilyMember> members = memberRepository.findByUserId(userId);
        List<FamilyMember> earners = members.stream().filter(FamilyMember::getIsEarner).toList();

        double totalIncome = earners.stream()
            .mapToDouble(m -> m.getMonthlyIncome() != null ? m.getMonthlyIncome() : 0)
            .sum();

        double savings = fp.getTotalSavings() != null ? fp.getTotalSavings() : 0;
        double expenses = fp.getMonthlyExpenses() != null ? fp.getMonthlyExpenses() : 1;
        double debt = fp.getTotalDebt() != null ? fp.getTotalDebt() : 0;

        int dependents = (int) members.stream().filter(m -> !m.getIsEarner()).count();
        int earnerCount = earners.size();
        int maxIncomeSources = 3;
        int maxSkills = 5;

        // 1. Emergency Buffer Ratio
        double ebr = savings / expenses;

        // 2. Income Diversity Score
        double ids = Math.min((double) earnerCount / maxIncomeSources, 1.0);

        // 3. Dependency Ratio
        double dr = earnerCount > 0 ? (double) dependents / earnerCount : dependents;

        // 4. Income Stability Factor
        double isf = earners.isEmpty() ? 0.4 :
            earners.stream().mapToDouble(e -> getStabilityValue(e.getIncomeStability())).average().orElse(0.4);

        // 5. Skill count
        long totalSkills = earners.stream()
            .mapToLong(e -> e.getSkills() != null && !e.getSkills().isBlank()
                ? Arrays.stream(e.getSkills().split(",")).filter(s -> !s.isBlank()).count() : 0)
            .sum();
        double skillScore = Math.min((double) totalSkills / maxSkills, 1.0);

        // Weights: w1=0.4, w2=0.2, w3=0.2, w4=0.2
        double rawScore = (0.4 * Math.min(ebr, 2.0)) + (0.2 * ids) - (0.2 * Math.min(dr, 2.0)) + (0.2 * isf);
        double efs = Math.max(0, Math.min(rawScore, 2.0)); // clamp 0-2

        // Risk Level
        String riskLevel;
        if (efs < 0.5) riskLevel = "HIGH RISK";
        else if (efs < 1.0) riskLevel = "MODERATE";
        else riskLevel = "STRONG";

        double survivalMonths = expenses > 0 ? savings / expenses : 0;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("economicFlexibilityScore", Math.round(efs * 100.0) / 100.0);
        result.put("riskLevel", riskLevel);
        result.put("emergencyBufferRatio", Math.round(ebr * 100.0) / 100.0);
        result.put("incomeDiversityScore", Math.round(ids * 100.0) / 100.0);
        result.put("dependencyRatio", Math.round(dr * 100.0) / 100.0);
        result.put("incomeStabilityFactor", Math.round(isf * 100.0) / 100.0);
        result.put("skillScore", Math.round(skillScore * 100.0) / 100.0);
        result.put("totalIncome", totalIncome);
        result.put("totalExpenses", expenses);
        result.put("totalSavings", savings);
        result.put("totalDebt", debt);
        result.put("survivalMonths", Math.round(survivalMonths * 10.0) / 10.0);
        result.put("earnerCount", earnerCount);
        result.put("dependentCount", dependents);

        return result;
    }

    // ==========================================
    //   3. SHOCK SIMULATION
    // ==========================================
    public Map<String, Object> simulateShock(Long userId, String shockType, double shockValue) {
        FinancialProfile fp = financialRepo.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Financial profile not found"));
        List<FamilyMember> earners = memberRepository.findByUserIdAndIsEarnerTrue(userId);

        double totalIncome = earners.stream()
            .mapToDouble(m -> m.getMonthlyIncome() != null ? m.getMonthlyIncome() : 0).sum();
        double expenses = fp.getMonthlyExpenses() != null ? fp.getMonthlyExpenses() : 0;
        double savings = fp.getTotalSavings() != null ? fp.getTotalSavings() : 0;

        double newIncome = totalIncome;
        double newExpenses = expenses;
        double newSavings = savings;

        String shockDescription;
        switch (shockType.toUpperCase()) {
            case "JOB_LOSS" -> {
                newIncome = 0;
                shockDescription = "Complete Job Loss";
            }
            case "INCOME_DROP_20" -> {
                newIncome = totalIncome * 0.80;
                shockDescription = "20% Income Drop";
            }
            case "INCOME_DROP_30" -> {
                newIncome = totalIncome * 0.70;
                shockDescription = "30% Income Drop";
            }
            case "MEDICAL_EMERGENCY" -> {
                newSavings = savings - shockValue;
                shockDescription = "Medical Emergency ₹" + shockValue;
            }
            case "MIGRATION_COST" -> {
                newSavings = savings - shockValue;
                shockDescription = "Migration Cost ₹" + shockValue;
            }
            case "SCHOOL_FEE_INCREASE" -> {
                newExpenses = expenses + shockValue;
                shockDescription = "School Fee Increase ₹" + shockValue + "/month";
            }
            default -> shockDescription = "Custom Shock";
        }

        double monthlyBalance = newIncome - newExpenses;
        double deficit = monthlyBalance < 0 ? Math.abs(monthlyBalance) : 0;
        double survivalMonths = deficit > 0 ? newSavings / deficit : 99;
        double debtRisk = newIncome > 0 ? (fp.getTotalDebt() != null ? fp.getTotalDebt() : 0) / newIncome : 99;

        String riskLevel;
        if (survivalMonths < 2) riskLevel = "HIGH";
        else if (survivalMonths < 4) riskLevel = "MEDIUM";
        else riskLevel = "LOW";

        // Strategies
        double reducedExpenses = newExpenses * 0.80;
        double survivalWithReducedExp = deficit > 0 ? newSavings / Math.abs(newIncome - reducedExpenses) : 99;

        double partTimeIncome = newIncome + 5000;
        double survivalWithPartTime = Math.abs(partTimeIncome - newExpenses) > 0
            ? newSavings / Math.abs(newIncome - newExpenses) : 99;
        boolean partTimeStabilizes = partTimeIncome >= newExpenses;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("shockType", shockDescription);
        result.put("originalIncome", totalIncome);
        result.put("newIncome", Math.round(newIncome * 100.0) / 100.0);
        result.put("originalExpenses", expenses);
        result.put("newExpenses", newExpenses);
        result.put("newSavings", Math.max(newSavings, 0));
        result.put("monthlyDeficit", deficit);
        result.put("survivalMonths", survivalMonths > 50 ? "Stable" : String.valueOf(Math.round(survivalMonths * 10.0) / 10.0));
        result.put("riskLevel", riskLevel);

        List<Map<String, Object>> strategies = new ArrayList<>();
        strategies.add(Map.of(
            "strategy", "Use Only Savings",
            "survivalMonths", survivalMonths > 50 ? "Stable" : Math.round(survivalMonths * 10.0) / 10.0,
            "riskLevel", riskLevel
        ));
        strategies.add(Map.of(
            "strategy", "Reduce Expenses by 20%",
            "survivalMonths", survivalWithReducedExp > 50 ? "Stable" : Math.round(survivalWithReducedExp * 10.0) / 10.0,
            "riskLevel", survivalWithReducedExp > 4 ? "LOW" : "MEDIUM"
        ));
        strategies.add(Map.of(
            "strategy", "Add Part-Time Job (₹5000/month)",
            "survivalMonths", partTimeStabilizes ? "Stable" : Math.round(survivalWithPartTime * 10.0) / 10.0,
            "riskLevel", partTimeStabilizes ? "LOW" : "MEDIUM"
        ));
        strategies.add(Map.of(
            "strategy", "Enroll in Government Scheme",
            "survivalMonths", "6+",
            "riskLevel", "MEDIUM"
        ));
        result.put("strategies", strategies);

        return result;
    }

    // ==========================================
    //   4. OPPORTUNITY MODE
    // ==========================================
    public Map<String, Object> simulateOpportunity(Long userId, double investmentCost,
                                                    double expectedIncomeIncrease,
                                                    double successProbability) {
        FinancialProfile fp = financialRepo.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Financial profile not found"));
        List<FamilyMember> earners = memberRepository.findByUserIdAndIsEarnerTrue(userId);

        double currentIncome = earners.stream()
            .mapToDouble(m -> m.getMonthlyIncome() != null ? m.getMonthlyIncome() : 0).sum();
        double expenses = fp.getMonthlyExpenses() != null ? fp.getMonthlyExpenses() : 0;
        double savings = fp.getTotalSavings() != null ? fp.getTotalSavings() : 0;

        // Step 1: New expected income
        double expectedIncrease = successProbability * expectedIncomeIncrease;
        double newIncome = currentIncome + expectedIncrease;

        // Step 2: Break-even time
        double breakEvenMonths = expectedIncrease > 0 ? investmentCost / expectedIncrease : 999;

        // Step 3: Survival before investment
        double survivalOld = expenses > 0 ? savings / expenses : 0;

        // Step 4: Survival after paying investment
        double savingsAfterInvestment = savings - investmentCost;
        double survivalNew = expenses > 0 ? Math.max(savingsAfterInvestment, 0) / expenses : 0;

        // Step 5: Monthly savings comparison
        double monthlySavingsBefore = currentIncome - expenses;
        double monthlySavingsAfter = newIncome - expenses;

        // Risk assessment
        String riskLevel;
        if (breakEvenMonths < 3 && savingsAfterInvestment > 0) riskLevel = "LOW";
        else if (breakEvenMonths < 6) riskLevel = "MEDIUM";
        else riskLevel = "HIGH";

        boolean worthIt = breakEvenMonths < 12 && monthlySavingsAfter > monthlySavingsBefore;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("currentIncome", currentIncome);
        result.put("newExpectedIncome", Math.round(newIncome * 100.0) / 100.0);
        result.put("investmentCost", investmentCost);
        result.put("breakEvenMonths", breakEvenMonths > 50 ? "Not advisable" : Math.round(breakEvenMonths * 10.0) / 10.0);
        result.put("survivalBeforeInvestment", Math.round(survivalOld * 10.0) / 10.0);
        result.put("survivalAfterInvestment", Math.round(survivalNew * 10.0) / 10.0);
        result.put("monthlySavingsBefore", Math.round(monthlySavingsBefore * 100.0) / 100.0);
        result.put("monthlySavingsAfter", Math.round(monthlySavingsAfter * 100.0) / 100.0);
        result.put("riskLevel", riskLevel);
        result.put("recommendation", worthIt
            ? "✅ This opportunity looks financially sound. Break-even in " + Math.round(breakEvenMonths) + " months."
            : "⚠️ High risk. Ensure you have enough savings buffer before investing.");

        return result;
    }

    // ==========================================
    //   5. RESILIENCE SCORE (monthly)
    // ==========================================
    public double calculateResilienceScore(double savings, double expenses,
                                           int incomeSources, int skills,
                                           double deltaSavings, double deltaDebt) {
        double efr = expenses > 0 ? savings / expenses : 0;
        double ids = Math.min((double) incomeSources / 3.0, 1.0);
        double ss = Math.min((double) skills / 5.0, 1.0);

        double score = 25 * Math.min(efr, 1.0)
                     + 25 * ids
                     + 20 * ss
                     + 15 * (deltaSavings / 1000.0)
                     + 15 * (deltaDebt / 1000.0);

        return Math.max(0, Math.min(score, 100));
    }
}
