#![forbid(unsafe_code)]

//! Shared, source-aware data types used by Fieldwork modules.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct SourceReference {
    pub id: String,
    pub name: String,
    pub url: String,
    pub retrieved_at: DateTime<Utc>,
    pub collection_method: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum Confidence {
    Low,
    Medium,
    High,
    Verified,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct EvidenceRecord {
    pub id: String,
    pub category: String,
    pub summary: String,
    pub source: SourceReference,
    pub confidence: Confidence,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Investigation {
    pub id: String,
    pub title: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub evidence: Vec<EvidenceRecord>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn confidence_serializes_as_snake_case() {
        assert_eq!(
            serde_json::to_string(&Confidence::Verified).unwrap(),
            "\"verified\""
        );
    }
}
