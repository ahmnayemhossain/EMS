-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "workflow_definitions" (
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "module_key" TEXT NOT NULL,
    "description" TEXT,
    "is_default" SMALLINT NOT NULL DEFAULT 0,
    "is_active" SMALLINT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_definitions_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "workflow_steps" (
    "id" BIGSERIAL NOT NULL,
    "workflow_key" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_initial" SMALLINT NOT NULL DEFAULT 0,
    "is_final" SMALLINT NOT NULL DEFAULT 0,
    "is_active" SMALLINT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_transitions" (
    "id" BIGSERIAL NOT NULL,
    "workflow_key" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "from_step_key" TEXT NOT NULL,
    "to_step_key" TEXT NOT NULL,
    "is_active" SMALLINT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_transitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_role_assignments" (
    "workflow_key" TEXT NOT NULL,
    "role_id" BIGINT NOT NULL,
    "transition_key" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_role_assignments_pkey" PRIMARY KEY ("workflow_key","role_id","transition_key")
);

-- CreateTable
CREATE TABLE "workflow_user_assignments" (
    "workflow_key" TEXT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "transition_key" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_user_assignments_pkey" PRIMARY KEY ("workflow_key","user_id","transition_key")
);

-- CreateTable
CREATE TABLE "workflow_instances" (
    "id" BIGSERIAL NOT NULL,
    "workflow_key" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" BIGINT NOT NULL,
    "current_step_key" TEXT NOT NULL,
    "company_id" BIGINT,
    "created_by_user_id" BIGINT,
    "updated_by_user_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_events" (
    "id" BIGSERIAL NOT NULL,
    "workflow_instance_id" BIGINT NOT NULL,
    "transition_key" TEXT,
    "from_step_key" TEXT NOT NULL,
    "to_step_key" TEXT NOT NULL,
    "actor_user_id" BIGINT,
    "note" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" BIGSERIAL NOT NULL,
    "table_name" TEXT NOT NULL,
    "row_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actor_user_id" BIGINT,
    "old_data" JSONB,
    "new_data" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_records" (
    "id" BIGSERIAL NOT NULL,
    "facility_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "customer_name" TEXT,
    "audit_date" DATE NOT NULL,
    "next_audit_date" DATE,
    "auditor" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "overall_score" INTEGER NOT NULL DEFAULT 0,
    "findings_count" JSONB NOT NULL DEFAULT '{"major": 0, "minor": 0, "critical": 0}',
    "checklist" JSONB NOT NULL DEFAULT '[]',
    "findings" JSONB NOT NULL DEFAULT '[]',
    "created_by_user_id" BIGINT,
    "updated_by_user_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capa_records" (
    "id" BIGSERIAL NOT NULL,
    "facility_id" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "owner_name" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "due_date" DATE NOT NULL,
    "evidence_count" INTEGER NOT NULL DEFAULT 0,
    "related_finding_id" TEXT,
    "position_index" INTEGER NOT NULL DEFAULT 0,
    "created_by_user_id" BIGINT,
    "updated_by_user_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_dismissed" SMALLINT NOT NULL DEFAULT 0,
    "dismissed_at" TIMESTAMPTZ(6),

    CONSTRAINT "capa_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chemicals" (
    "id" BIGSERIAL NOT NULL,
    "facility_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "trade_name" TEXT,
    "supplier" TEXT NOT NULL DEFAULT '',
    "storage_area" TEXT NOT NULL,
    "hazard_classes" JSONB NOT NULL DEFAULT '[]',
    "approval_status" TEXT NOT NULL DEFAULT 'pending',
    "stock_kg" DECIMAL NOT NULL DEFAULT 0,
    "min_stock_kg" DECIMAL,
    "expiry_date" DATE,
    "sds_id" BIGINT,
    "ppe" JSONB NOT NULL DEFAULT '[]',
    "storage_instructions" JSONB NOT NULL DEFAULT '[]',
    "compatibility_warnings" JSONB NOT NULL DEFAULT '[]',
    "linked_waste_stream" TEXT,
    "batches" JSONB NOT NULL DEFAULT '[]',
    "created_by_user_id" BIGINT,
    "updated_by_user_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chemicals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "short_name" TEXT NOT NULL,
    "local_name" TEXT,
    "address" TEXT,
    "is_active" SMALLINT NOT NULL DEFAULT 1,
    "created_by_user_id" BIGINT,
    "updated_by_user_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" SMALLINT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_user_id" BIGINT,
    "updated_by_user_id" BIGINT,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "designations" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" SMALLINT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_user_id" BIGINT,
    "updated_by_user_id" BIGINT,

    CONSTRAINT "designations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_records" (
    "id" BIGSERIAL NOT NULL,
    "facility_id" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "owner_department" TEXT NOT NULL,
    "expires_on" DATE,
    "status" TEXT NOT NULL DEFAULT 'valid',
    "file_name" TEXT NOT NULL,
    "notes" TEXT,
    "created_by_user_id" BIGINT,
    "updated_by_user_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_notification_settings" (
    "id" BIGSERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "is_active" SMALLINT NOT NULL DEFAULT 0,
    "smtp_host" TEXT,
    "smtp_port" INTEGER,
    "smtp_secure" SMALLINT NOT NULL DEFAULT 1,
    "smtp_username" TEXT,
    "smtp_password" TEXT,
    "from_name" TEXT,
    "from_email" TEXT,
    "recipient_emails" JSONB NOT NULL DEFAULT '[]',
    "subject_template" TEXT NOT NULL DEFAULT 'Login alert: {{userName}}',
    "html_template" TEXT NOT NULL DEFAULT '<!doctype html><html><body><h2>Login alert</h2><p><strong>{{userName}}</strong> signed in to {{appName}}.</p><p>Username: {{username}}</p><p>Employee ID: {{employeeId}}</p><p>Email: {{userEmail}}</p><p>Time: {{loginAt}}</p><p>IP: {{ipAddress}}</p></body></html>',
    "created_by_user_id" BIGINT,
    "updated_by_user_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" BIGSERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "company_id" BIGINT,
    "department_id" BIGINT,
    "designation_id" BIGINT,
    "is_active" SMALLINT NOT NULL DEFAULT 1,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "joined_on" DATE,
    "created_by_user_id" BIGINT,
    "updated_by_user_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_assets" (
    "id" BIGSERIAL NOT NULL,
    "module" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" BIGINT NOT NULL,
    "company_id" BIGINT,
    "original_name" TEXT NOT NULL,
    "stored_name" TEXT NOT NULL,
    "storage_disk" TEXT NOT NULL DEFAULT 'local-cdn',
    "storage_path" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_size" BIGINT NOT NULL,
    "uploaded_by_user_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meters" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "location" TEXT,
    "company_id" BIGINT NOT NULL,
    "utility_type_id" BIGINT NOT NULL,
    "source_id" BIGINT,
    "uom_id" BIGINT NOT NULL,
    "is_active" SMALLINT NOT NULL DEFAULT 1,
    "created_by_user_id" BIGINT,
    "updated_by_user_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" BIGSERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_definitions" (
    "id" BIGSERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "requires_company" SMALLINT NOT NULL DEFAULT 1,
    "sql_text" TEXT NOT NULL,
    "variables" JSONB NOT NULL DEFAULT '[]',
    "is_active" SMALLINT NOT NULL DEFAULT 1,
    "created_by_user_id" BIGINT,
    "updated_by_user_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" BIGSERIAL NOT NULL,
    "role_id" BIGINT NOT NULL,
    "permission_id" BIGINT NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "scope" TEXT NOT NULL DEFAULT 'company',
    "description" TEXT,
    "is_active" SMALLINT NOT NULL DEFAULT 1,
    "created_by_user_id" BIGINT,
    "updated_by_user_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sds_records" (
    "id" BIGSERIAL NOT NULL,
    "chemical_name" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "revision_date" DATE NOT NULL,
    "file_name" TEXT,
    "notes" TEXT,
    "is_active" SMALLINT NOT NULL DEFAULT 1,
    "created_by_user_id" BIGINT,
    "updated_by_user_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sds_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sds_sections" (
    "id" BIGSERIAL NOT NULL,
    "sds_id" BIGINT NOT NULL,
    "section_no" SMALLINT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,

    CONSTRAINT "sds_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "source_wiring" (
    "id" BIGSERIAL NOT NULL,
    "source_id" BIGINT NOT NULL,
    "utility_type_id" BIGINT NOT NULL,
    "is_active" SMALLINT NOT NULL DEFAULT 1,
    "created_by_user_id" BIGINT,
    "updated_by_user_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "source_wiring_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sources" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" SMALLINT NOT NULL DEFAULT 1,
    "created_by_user_id" BIGINT,
    "updated_by_user_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" SMALLINT NOT NULL DEFAULT 1,
    "created_by_user_id" BIGINT,
    "updated_by_user_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uom" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" SMALLINT NOT NULL DEFAULT 1,
    "created_by_user_id" BIGINT,
    "updated_by_user_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uom_wiring" (
    "id" BIGSERIAL NOT NULL,
    "uom_id" BIGINT NOT NULL,
    "utility_type_id" BIGINT NOT NULL,
    "is_active" SMALLINT NOT NULL DEFAULT 1,
    "created_by_user_id" BIGINT,
    "updated_by_user_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uom_wiring_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_companies" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "company_id" BIGINT NOT NULL,

    CONSTRAINT "user_companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "role_id" BIGINT NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "employee_id" BIGINT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "password_hash" TEXT,
    "last_login_at" TIMESTAMPTZ(6),
    "created_by_user_id" BIGINT,
    "updated_by_user_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utility_conversion_rules" (
    "id" BIGSERIAL NOT NULL,
    "company_id" BIGINT,
    "key" TEXT NOT NULL,
    "value" DECIMAL NOT NULL,
    "is_active" SMALLINT NOT NULL DEFAULT 1,
    "created_by_user_id" BIGINT,
    "updated_by_user_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utility_conversion_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utility_periods" (
    "id" BIGSERIAL NOT NULL,
    "facility_id" BIGINT NOT NULL,
    "type" TEXT NOT NULL,
    "meter_id" BIGINT,
    "meter_key" TEXT NOT NULL,
    "meter_name" TEXT NOT NULL,
    "source_id" BIGINT,
    "period_month" DATE NOT NULL,
    "coverage_start" DATE,
    "coverage_end" DATE,
    "covered_days" INTEGER NOT NULL DEFAULT 0,
    "month_days" INTEGER NOT NULL DEFAULT 0,
    "missing_ranges" JSONB NOT NULL DEFAULT '[]',
    "missing_days_count" INTEGER NOT NULL DEFAULT 0,
    "record_count" INTEGER NOT NULL DEFAULT 0,
    "total_value" DECIMAL NOT NULL DEFAULT 0,
    "total_diesel_liters" DECIMAL,
    "uom" TEXT,
    "created_by_user_id" BIGINT,
    "updated_by_user_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utility_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utility_records" (
    "id" BIGSERIAL NOT NULL,
    "facility_id" BIGINT NOT NULL,
    "type" TEXT NOT NULL,
    "source_id" BIGINT,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "meter_name" TEXT NOT NULL,
    "previous_reading" DECIMAL,
    "current_reading" DECIMAL,
    "uom" TEXT NOT NULL,
    "value" DECIMAL NOT NULL,
    "baseline_value" DECIMAL,
    "min_threshold" DECIMAL,
    "max_threshold" DECIMAL,
    "variance" DECIMAL,
    "variance_percent" DECIMAL,
    "variance_flag" TEXT,
    "status" TEXT,
    "remarks" TEXT,
    "bill_files" JSONB NOT NULL DEFAULT '[]',
    "created_by_user_id" BIGINT,
    "updated_by_user_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "meter_id" BIGINT,
    "diesel_liters" DECIMAL,
    "calc_method" TEXT,
    "calc_factor" DECIMAL,
    "meter_key" TEXT,
    "period_month" DATE,

    CONSTRAINT "utility_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utility_types" (
    "id" BIGSERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" SMALLINT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utility_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waste_records" (
    "id" BIGSERIAL NOT NULL,
    "facility_id" BIGINT NOT NULL,
    "log_date" DATE NOT NULL,
    "stream" TEXT NOT NULL,
    "waste_type" TEXT NOT NULL,
    "qty_kg" DECIMAL NOT NULL DEFAULT 0,
    "storage_location" TEXT NOT NULL,
    "vendor" TEXT,
    "disposal_status" TEXT NOT NULL DEFAULT 'stored',
    "manifest_no" TEXT,
    "due_by" DATE,
    "notes" TEXT,
    "created_by_user_id" BIGINT,
    "updated_by_user_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "waste_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wastewater_lab_records" (
    "id" BIGSERIAL NOT NULL,
    "facility_id" BIGINT NOT NULL,
    "sample_date" DATE NOT NULL,
    "sample_point" TEXT NOT NULL,
    "ph" DECIMAL NOT NULL,
    "cod" DECIMAL NOT NULL,
    "bod" DECIMAL NOT NULL,
    "tss" DECIMAL NOT NULL,
    "do_value" DECIMAL,
    "lab_report_name" TEXT,
    "notes" TEXT,
    "created_by_user_id" BIGINT,
    "updated_by_user_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wastewater_lab_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_workflow_definitions_module" ON "workflow_definitions"("module_key", "is_default", "is_active");

-- CreateIndex
CREATE INDEX "idx_workflow_steps_workflow" ON "workflow_steps"("workflow_key", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "ux_workflow_steps_workflow_key" ON "workflow_steps"("workflow_key", "key");

-- CreateIndex
CREATE INDEX "idx_workflow_transitions_steps" ON "workflow_transitions"("workflow_key", "from_step_key", "to_step_key");

-- CreateIndex
CREATE UNIQUE INDEX "ux_workflow_transitions_workflow_key" ON "workflow_transitions"("workflow_key", "key");

-- CreateIndex
CREATE INDEX "idx_workflow_role_assignments_role" ON "workflow_role_assignments"("role_id", "workflow_key");

-- CreateIndex
CREATE INDEX "idx_workflow_user_assignments_user" ON "workflow_user_assignments"("user_id", "workflow_key");

-- CreateIndex
CREATE INDEX "idx_workflow_instances_company" ON "workflow_instances"("company_id", "workflow_key");

-- CreateIndex
CREATE UNIQUE INDEX "ux_workflow_instances_entity" ON "workflow_instances"("workflow_key", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "idx_workflow_events_instance" ON "workflow_events"("workflow_instance_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_workflow_events_actor" ON "workflow_events"("actor_user_id");

-- CreateIndex
CREATE INDEX "idx_audit_logs_actor_user_id" ON "audit_logs"("actor_user_id");

-- CreateIndex
CREATE INDEX "idx_audit_logs_created_at" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "idx_audit_logs_table_row" ON "audit_logs"("table_name", "row_id");

-- CreateIndex
CREATE INDEX "idx_audit_records_facility_date" ON "audit_records"("facility_id", "audit_date" DESC);

-- CreateIndex
CREATE INDEX "idx_capa_records_due_date" ON "capa_records"("due_date");

-- CreateIndex
CREATE INDEX "idx_capa_records_facility_status_position" ON "capa_records"("facility_id", "status", "position_index");

-- CreateIndex
CREATE INDEX "idx_chemicals_facility_id" ON "chemicals"("facility_id");

-- CreateIndex
CREATE INDEX "idx_chemicals_sds_id" ON "chemicals"("sds_id");

-- CreateIndex
CREATE UNIQUE INDEX "companies_name_key" ON "companies"("name");

-- CreateIndex
CREATE UNIQUE INDEX "companies_short_name_key" ON "companies"("short_name");

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "designations_name_key" ON "designations"("name");

-- CreateIndex
CREATE INDEX "idx_document_records_facility_date" ON "document_records"("facility_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_document_records_status" ON "document_records"("status");

-- CreateIndex
CREATE UNIQUE INDEX "email_notification_settings_key_key" ON "email_notification_settings"("key");

-- CreateIndex
CREATE INDEX "idx_email_notification_settings_key" ON "email_notification_settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "employees_employee_id_key" ON "employees"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "employees_email_key" ON "employees"("email");

-- CreateIndex
CREATE INDEX "idx_file_assets_company" ON "file_assets"("company_id");

-- CreateIndex
CREATE INDEX "idx_file_assets_entity" ON "file_assets"("module", "entity_type", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "meters_company_id_utility_type_id_name_key" ON "meters"("company_id", "utility_type_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_key_key" ON "permissions"("key");

-- CreateIndex
CREATE UNIQUE INDEX "report_definitions_key_key" ON "report_definitions"("key");

-- CreateIndex
CREATE INDEX "idx_report_definitions_active" ON "report_definitions"("is_active");

-- CreateIndex
CREATE INDEX "idx_report_definitions_key" ON "report_definitions"("key");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE INDEX "idx_sds_records_revision_date" ON "sds_records"("revision_date");

-- CreateIndex
CREATE UNIQUE INDEX "sds_sections_sds_id_section_no_key" ON "sds_sections"("sds_id", "section_no");

-- CreateIndex
CREATE UNIQUE INDEX "source_wiring_source_id_utility_type_id_key" ON "source_wiring"("source_id", "utility_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "sources_name_key" ON "sources"("name");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_name_key" ON "suppliers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "idx_uom_name_unique" ON "uom"("name");

-- CreateIndex
CREATE UNIQUE INDEX "uom_wiring_uom_id_utility_type_id_key" ON "uom_wiring"("uom_id", "utility_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_companies_user_id_company_id_key" ON "user_companies"("user_id", "company_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_id_key" ON "user_roles"("user_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_employee_id_key" ON "users"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_utility_conversion_rules_key" ON "utility_conversion_rules"("key");

-- CreateIndex
CREATE UNIQUE INDEX "utility_conversion_rules_company_id_key_key" ON "utility_conversion_rules"("company_id", "key");

-- CreateIndex
CREATE INDEX "idx_utility_periods_company_month" ON "utility_periods"("facility_id", "period_month");

-- CreateIndex
CREATE UNIQUE INDEX "utility_periods_facility_id_type_meter_key_period_month_key" ON "utility_periods"("facility_id", "type", "meter_key", "period_month");

-- CreateIndex
CREATE INDEX "idx_utility_records_facility_id" ON "utility_records"("facility_id");

-- CreateIndex
CREATE INDEX "idx_utility_records_month_key" ON "utility_records"("facility_id", "type", "meter_key", "period_month");

-- CreateIndex
CREATE INDEX "idx_utility_records_period_start" ON "utility_records"("period_start");

-- CreateIndex
CREATE INDEX "idx_utility_records_type" ON "utility_records"("type");

-- CreateIndex
CREATE UNIQUE INDEX "utility_types_key_key" ON "utility_types"("key");

-- CreateIndex
CREATE UNIQUE INDEX "utility_types_name_key" ON "utility_types"("name");

-- CreateIndex
CREATE INDEX "idx_waste_records_facility_date" ON "waste_records"("facility_id", "log_date" DESC);

-- CreateIndex
CREATE INDEX "idx_waste_records_status" ON "waste_records"("disposal_status");

-- CreateIndex
CREATE INDEX "idx_wastewater_lab_records_facility_date" ON "wastewater_lab_records"("facility_id", "sample_date" DESC);

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_records" ADD CONSTRAINT "audit_records_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_records" ADD CONSTRAINT "audit_records_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_records" ADD CONSTRAINT "audit_records_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capa_records" ADD CONSTRAINT "capa_records_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capa_records" ADD CONSTRAINT "capa_records_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capa_records" ADD CONSTRAINT "capa_records_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chemicals" ADD CONSTRAINT "chemicals_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chemicals" ADD CONSTRAINT "chemicals_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chemicals" ADD CONSTRAINT "chemicals_sds_id_fkey" FOREIGN KEY ("sds_id") REFERENCES "sds_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chemicals" ADD CONSTRAINT "chemicals_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "designations" ADD CONSTRAINT "designations_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "designations" ADD CONSTRAINT "designations_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_records" ADD CONSTRAINT "document_records_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_records" ADD CONSTRAINT "document_records_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_records" ADD CONSTRAINT "document_records_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_notification_settings" ADD CONSTRAINT "email_notification_settings_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_notification_settings" ADD CONSTRAINT "email_notification_settings_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_designation_id_fkey" FOREIGN KEY ("designation_id") REFERENCES "designations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_assets" ADD CONSTRAINT "file_assets_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_assets" ADD CONSTRAINT "file_assets_uploaded_by_user_id_fkey" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meters" ADD CONSTRAINT "meters_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meters" ADD CONSTRAINT "meters_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meters" ADD CONSTRAINT "meters_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meters" ADD CONSTRAINT "meters_uom_id_fkey" FOREIGN KEY ("uom_id") REFERENCES "uom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meters" ADD CONSTRAINT "meters_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meters" ADD CONSTRAINT "meters_utility_type_id_fkey" FOREIGN KEY ("utility_type_id") REFERENCES "utility_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_definitions" ADD CONSTRAINT "report_definitions_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_definitions" ADD CONSTRAINT "report_definitions_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sds_records" ADD CONSTRAINT "sds_records_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sds_records" ADD CONSTRAINT "sds_records_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sds_sections" ADD CONSTRAINT "sds_sections_sds_id_fkey" FOREIGN KEY ("sds_id") REFERENCES "sds_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_wiring" ADD CONSTRAINT "source_wiring_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_wiring" ADD CONSTRAINT "source_wiring_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_wiring" ADD CONSTRAINT "source_wiring_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_wiring" ADD CONSTRAINT "source_wiring_utility_type_id_fkey" FOREIGN KEY ("utility_type_id") REFERENCES "utility_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sources" ADD CONSTRAINT "sources_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sources" ADD CONSTRAINT "sources_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uom" ADD CONSTRAINT "uom_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uom" ADD CONSTRAINT "uom_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uom_wiring" ADD CONSTRAINT "uom_wiring_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uom_wiring" ADD CONSTRAINT "uom_wiring_uom_id_fkey" FOREIGN KEY ("uom_id") REFERENCES "uom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uom_wiring" ADD CONSTRAINT "uom_wiring_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uom_wiring" ADD CONSTRAINT "uom_wiring_utility_type_id_fkey" FOREIGN KEY ("utility_type_id") REFERENCES "utility_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_companies" ADD CONSTRAINT "user_companies_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_companies" ADD CONSTRAINT "user_companies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utility_conversion_rules" ADD CONSTRAINT "utility_conversion_rules_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utility_conversion_rules" ADD CONSTRAINT "utility_conversion_rules_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utility_conversion_rules" ADD CONSTRAINT "utility_conversion_rules_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utility_records" ADD CONSTRAINT "utility_records_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utility_records" ADD CONSTRAINT "utility_records_facility_id_companies_fkey" FOREIGN KEY ("facility_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utility_records" ADD CONSTRAINT "utility_records_meter_id_fkey" FOREIGN KEY ("meter_id") REFERENCES "meters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utility_records" ADD CONSTRAINT "utility_records_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utility_records" ADD CONSTRAINT "utility_records_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waste_records" ADD CONSTRAINT "waste_records_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waste_records" ADD CONSTRAINT "waste_records_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waste_records" ADD CONSTRAINT "waste_records_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wastewater_lab_records" ADD CONSTRAINT "wastewater_lab_records_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wastewater_lab_records" ADD CONSTRAINT "wastewater_lab_records_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wastewater_lab_records" ADD CONSTRAINT "wastewater_lab_records_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
