-- AlterTable
CREATE SEQUENCE checklist_id_seq;
ALTER TABLE "Checklist" ALTER COLUMN "id" SET DEFAULT nextval('checklist_id_seq');
ALTER SEQUENCE checklist_id_seq OWNED BY "Checklist"."id";

-- AlterTable
CREATE SEQUENCE checklistitem_id_seq;
ALTER TABLE "ChecklistItem" ALTER COLUMN "id" SET DEFAULT nextval('checklistitem_id_seq');
ALTER SEQUENCE checklistitem_id_seq OWNED BY "ChecklistItem"."id";

-- AlterTable
CREATE SEQUENCE game_id_seq;
ALTER TABLE "Game" ALTER COLUMN "id" SET DEFAULT nextval('game_id_seq');
ALTER SEQUENCE game_id_seq OWNED BY "Game"."id";
