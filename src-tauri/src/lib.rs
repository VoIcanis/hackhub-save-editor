use std::fs::File;
use std::io::Read;
use std::io::Write;
use flate2::read::GzDecoder;
use flate2::write::GzEncoder;
use flate2::Compression;
use tauri_plugin_dialog::DialogExt;

#[tauri::command]
async fn load_save_file(app: tauri::AppHandle) -> Result<serde_json::Value, String> {
    let file_path = app.dialog()
        .file()
        .add_filter("Save Files", &["hhsav"])
        .blocking_pick_file();

    let path = file_path.ok_or("No file selected")?;

    let mut file = File::open(path.into_path().map_err(|e| e.to_string())?).map_err(|e| e.to_string())?;
    let mut compressed_data = Vec::new();
    file.read_to_end(&mut compressed_data).map_err(|e| e.to_string())?;

    let mut decoder = GzDecoder::new(&compressed_data[..]);
    let mut json_str = String::new();
    decoder.read_to_string(&mut json_str).map_err(|e| e.to_string())?;

    let json: serde_json::Value = serde_json::from_str(&json_str).map_err(|e| e.to_string())?;
    
    Ok(json)
}

#[tauri::command]
async fn save_hhsav_file(app: tauri::AppHandle, data: serde_json::Value, suggested_name: String) -> Result<String, String> {
    let file_path = app.dialog()
        .file()
        .add_filter("HHSV Save File", &["hhsav"])
        .set_file_name(suggested_name)
        .blocking_save_file();

    let path = file_path.ok_or("Save cancelled")?;
    let system_path = path.into_path().map_err(|e| e.to_string())?;

    let json_str = serde_json::to_string(&data).map_err(|e| e.to_string())?;

    let mut encoder = GzEncoder::new(Vec::new(), Compression::default());
    encoder.write_all(json_str.as_bytes()).map_err(|e| e.to_string())?;
    let compressed_bytes = encoder.finish().map_err(|e| e.to_string())?;

    std::fs::write(system_path, compressed_bytes).map_err(|e| e.to_string())?;

    Ok("File saved successfully!".into())
}

#[tauri::command]
async fn save_json_file(app: tauri::AppHandle, data: serde_json::Value, suggested_name: String) -> Result<String, String> {
    let file_path = app.dialog()
        .file()
        .add_filter("JSON File", &["json"])
        .set_file_name(suggested_name)
        .blocking_save_file();

    let path = file_path.ok_or("Save cancelled")?;
    let system_path = path.into_path().map_err(|e| e.to_string())?;

    let json_str = serde_json::to_string_pretty(&data).map_err(|e| e.to_string())?;

    std::fs::write(system_path, json_str).map_err(|e| e.to_string())?;

    Ok("JSON exported successfully!".into())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![load_save_file, save_hhsav_file, save_json_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}