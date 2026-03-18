import { Router } from "express";
import { requireAdmin } from "../config/auth.js";
import {
    getTierCategories,
    getTierCategory,
    createTierCategory,
    deleteTierCategory,
    createTierItem,
    deleteTierItem,
    createTierMode,
    deleteTierMode,
    createTierTier,
    updateTierTier,
    deleteTierTier,
    createTierEntry,
    deleteTierEntry,
    createTierSection,
    deleteTierSection,
} from "../controllers/tierController.js";

const router = Router({ mergeParams: true });

// Categories
router.get("/tier-categories", getTierCategories);
router.post("/tier-categories", requireAdmin, createTierCategory);
router.get("/tier-categories/:id", getTierCategory);
router.delete("/tier-categories/:id", requireAdmin, deleteTierCategory);

// Items
router.post("/tier-categories/:categoryId/items", requireAdmin, createTierItem);
router.delete("/tier-categories/:categoryId/items/:itemId", requireAdmin, deleteTierItem);

// Modes
router.post("/tier-categories/:categoryId/modes", requireAdmin, createTierMode);
router.delete("/tier-categories/:categoryId/modes/:modeId", requireAdmin, deleteTierMode);

// Tiers
router.post("/tier-categories/:categoryId/modes/:modeId/tiers", requireAdmin, createTierTier);
router.put("/tier-categories/:categoryId/modes/:modeId/tiers/:tierId", requireAdmin, updateTierTier);
router.delete("/tier-categories/:categoryId/modes/:modeId/tiers/:tierId", requireAdmin, deleteTierTier);

// Sections
router.post("/tier-categories/:categoryId/modes/:modeId/sections", requireAdmin, createTierSection);
router.delete("/tier-categories/:categoryId/modes/:modeId/sections/:sectionId", requireAdmin, deleteTierSection);

// Entries
router.post("/tier-categories/:categoryId/modes/:modeId/entries", requireAdmin, createTierEntry);
router.delete("/tier-categories/:categoryId/modes/:modeId/entries/:entryId", requireAdmin, deleteTierEntry);

export default router;
