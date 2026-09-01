terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
    }
  }
}

provider "google" {
  project = "cloud-portfolio-789"
  region  = "us-central1"
}

# VPC Network
resource "google_compute_network" "vpc" {
  name                    = "training-vpc"
  auto_create_subnetworks = false
}

# Service Accounts
resource "google_service_account" "app" {
  account_id   = "adrian-day6-app"
  display_name = "adrian-day6-app"
}

resource "google_service_account" "worker" {
  account_id   = "adrian-day6-worker"
  display_name = "adrian-day6-worker"
}

# Cloud SQL
resource "google_sql_database_instance" "db" {
  name             = "training-db"
  database_version = "POSTGRES_15"
  region           = "us-central1"

  settings {
    tier = "db-f1-micro"
  }
}

resource "google_sql_database" "postgres" {
  name     = "postgres"
  instance = google_sql_database_instance.db.name
}

# Cloud Run
resource "google_cloud_run_service" "app" {
  name     = "adrian-day6-app"
  location = "us-central1"

  template {
    spec {
      containers {
        image = "gcr.io/cloud-portfolio-789/adrian-day6-app"
        ports {
          container_port = 8080
        }
      }
    }
  }
}


