use std::str::FromStr;

use bson::Document;

pub fn get_optional_uuid(doc: &Document, field_name: &str) -> Option<uuid::Uuid> {
    doc.get_str(field_name)
        .ok()
        .and_then(|v| uuid::Uuid::from_str(v).ok())
}
