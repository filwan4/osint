#![forbid(unsafe_code)]

//! Input validation and public-infrastructure research primitives.

use std::{net::IpAddr, str::FromStr};
use thiserror::Error;

#[derive(Debug, Error, PartialEq, Eq)]
pub enum DomainValidationError {
    #[error("domain cannot be empty")]
    Empty,
    #[error("expected a DNS domain, not an IP address")]
    IpAddress,
    #[error("domain has an invalid length")]
    InvalidLength,
    #[error("domain contains an invalid label")]
    InvalidLabel,
    #[error("domain must contain at least two labels")]
    MissingSuffix,
}

/// Normalize and validate a DNS name before it is passed to a collector.
/// ASCII DNS names only; internationalized names need an IDNA conversion layer.
pub fn validate_domain(input: &str) -> Result<String, DomainValidationError> {
    let domain = input.trim().trim_end_matches('.').to_ascii_lowercase();

    if domain.is_empty() {
        return Err(DomainValidationError::Empty);
    }
    if IpAddr::from_str(&domain).is_ok() {
        return Err(DomainValidationError::IpAddress);
    }
    if domain.len() > 253 {
        return Err(DomainValidationError::InvalidLength);
    }

    let labels: Vec<&str> = domain.split('.').collect();
    if labels.len() < 2 {
        return Err(DomainValidationError::MissingSuffix);
    }

    for label in labels {
        if label.is_empty()
            || label.len() > 63
            || label.starts_with('-')
            || label.ends_with('-')
            || !label
                .bytes()
                .all(|b| b.is_ascii_alphanumeric() || b == b'-')
        {
            return Err(DomainValidationError::InvalidLabel);
        }
    }

    Ok(domain)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn normalizes_domain() {
        assert_eq!(validate_domain("  Example.COM. ").unwrap(), "example.com");
    }

    #[test]
    fn rejects_ip_addresses() {
        assert_eq!(
            validate_domain("192.0.2.10"),
            Err(DomainValidationError::IpAddress)
        );
    }

    #[test]
    fn rejects_invalid_labels() {
        assert_eq!(
            validate_domain("-bad.example"),
            Err(DomainValidationError::InvalidLabel)
        );
    }

    #[test]
    fn requires_suffix() {
        assert_eq!(
            validate_domain("localhost"),
            Err(DomainValidationError::MissingSuffix)
        );
    }
}
