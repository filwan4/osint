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
    #[error("domain contains an invalid label; use letters, numbers, or hyphens")]
    InvalidLabel,
    #[error("domain must contain at least two labels")]
    MissingSuffix,
}

/// Normalize and validate an ASCII DNS name before it is passed to a collector.
///
/// A single final dot is accepted as the DNS root marker. Internationalized
/// names must be converted to their ASCII/Punycode form before validation.
pub fn validate_domain(input: &str) -> Result<String, DomainValidationError> {
    let trimmed = input.trim();
    let without_root_dot = trimmed.strip_suffix('.').unwrap_or(trimmed);
    let domain = without_root_dot.to_ascii_lowercase();

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
                .all(|byte| byte.is_ascii_alphanumeric() || byte == b'-')
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
    fn accepts_one_dns_root_dot() {
        assert_eq!(validate_domain("Example.COM.").unwrap(), "example.com");
    }

    #[test]
    fn rejects_repeated_trailing_dots() {
        assert_eq!(
            validate_domain("example.com.."),
            Err(DomainValidationError::InvalidLabel)
        );
    }

    #[test]
    fn rejects_ip_addresses() {
        assert_eq!(
            validate_domain("192.0.2.10"),
            Err(DomainValidationError::IpAddress)
        );
        assert_eq!(
            validate_domain("2001:db8::1"),
            Err(DomainValidationError::IpAddress)
        );
    }

    #[test]
    fn rejects_invalid_labels() {
        assert_eq!(
            validate_domain("-bad.example"),
            Err(DomainValidationError::InvalidLabel)
        );
        assert_eq!(
            validate_domain("bad-.example"),
            Err(DomainValidationError::InvalidLabel)
        );
        assert_eq!(
            validate_domain("bad_name.example"),
            Err(DomainValidationError::InvalidLabel)
        );
    }

    #[test]
    fn rejects_empty_labels() {
        assert_eq!(
            validate_domain("example..com"),
            Err(DomainValidationError::InvalidLabel)
        );
    }

    #[test]
    fn rejects_labels_longer_than_63_characters() {
        let domain = format!("{}.com", "a".repeat(64));
        assert_eq!(
            validate_domain(&domain),
            Err(DomainValidationError::InvalidLabel)
        );
    }

    #[test]
    fn accepts_maximum_domain_length() {
        let domain = format!(
            "{}.{}.{}.{}",
            "a".repeat(63),
            "b".repeat(63),
            "c".repeat(63),
            "d".repeat(61)
        );
        assert_eq!(domain.len(), 253);
        assert_eq!(validate_domain(&domain).unwrap(), domain);
    }

    #[test]
    fn rejects_domains_longer_than_253_characters() {
        let domain = format!(
            "{}.{}.{}.{}",
            "a".repeat(63),
            "b".repeat(63),
            "c".repeat(63),
            "d".repeat(62)
        );
        assert_eq!(domain.len(), 254);
        assert_eq!(
            validate_domain(&domain),
            Err(DomainValidationError::InvalidLength)
        );
    }

    #[test]
    fn requires_suffix() {
        assert_eq!(
            validate_domain("localhost"),
            Err(DomainValidationError::MissingSuffix)
        );
    }

    #[test]
    fn rejects_empty_input() {
        assert_eq!(validate_domain("   "), Err(DomainValidationError::Empty));
    }
}
