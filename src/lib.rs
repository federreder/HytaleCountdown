// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

use std::sync::Mutex;
use once_cell::sync::Lazy;

static TARGET_TIME: Lazy<Mutex<Option<chrono::DateTime<chrono::Utc>>>> = Lazy::new(|| Mutex::new(None));

#[derive(serde::Serialize)]
struct Countdown {
    days: i64,
    hours: i64,
    minutes: i64,
    seconds: i64,
}

#[tauri::command]
fn get_countdown() -> Result<Countdown, String> {
    let mut target_time = TARGET_TIME.lock().unwrap();

    // If we don't have a cached target time, fetch it from the server
    if target_time.is_none() {
        let url = "https://hytale.com/countdown";
        let response = reqwest::blocking::get(url).map_err(|e| e.to_string())?;
        let html = response.text().map_err(|e| e.to_string())?;

        let document = scraper::Html::parse_document(&html);
        let selector = scraper::Selector::parse("countdown").map_err(|e| e.to_string())?;
        let countdown_element = document.select(&selector).next().ok_or("Countdown element not found")?;
        let date_attr = countdown_element.value().attr("date").ok_or("Date attribute not found")?;

        *target_time = Some(chrono::DateTime::parse_from_rfc3339(date_attr).map_err(|e| e.to_string())?.into());
    }

    let target = target_time.as_ref().unwrap();
    let now = chrono::Utc::now();
    let duration = target.signed_duration_since(now);

    if duration.num_seconds() < 0 {
        return Ok(Countdown {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
        });
    }

    let days = duration.num_days();
    let hours = duration.num_hours() % 24;
    let minutes = duration.num_minutes() % 60;
    let seconds = duration.num_seconds() % 60;

    Ok(Countdown {
        days,
        hours,
        minutes,
        seconds,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, get_countdown])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
