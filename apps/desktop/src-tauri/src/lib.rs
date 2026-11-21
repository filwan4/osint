#![forbid(unsafe_code)]

#[tauri::command]
fn validate_domain(domain: String) -> Result<String, String> {
    fieldwork_infrastructure::validate_domain(&domain)
        .map_err(|error| error.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![validate_domain])
        .run(tauri::generate_context!())
        .expect("error while running Fieldwork");
}
