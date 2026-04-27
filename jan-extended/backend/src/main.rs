use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use warp::Filter;
use tokio::sync::Mutex;
use std::sync::Arc;

#[derive(Debug, Serialize, Deserialize, Clone)]
struct Tool {
    name: String,
    description: String,
    parameters: serde_json::Value,
}

#[derive(Debug, Serialize, Deserialize)]
struct McpRequest {
    jsonrpc: String,
    method: String,
    params: serde_json::Value,
    id: serde_json::Value,
}

#[derive(Debug, Serialize, Deserialize)]
struct McpResponse {
    jsonrpc: String,
    result: Option<serde_json::Value>,
    error: Option<serde_json::Value>,
    id: serde_json::Value,
}

struct AppState {
    tools: HashMap<String, Tool>,
}

#[tokio::main]
async fn main() {
    let state = Arc::new(Mutex::new(AppState {
        tools: init_tools(),
    }));

    let state_filter = warp::any().map(move || Arc::clone(&state));

    let mcp_route = warp::post()
        .and(warp::path("mcp"))
        .and(warp::body::json())
        .and(state_filter)
        .and_then(handle_mcp_request);

    println!("Jan-Extended Backend running on http://localhost:3000/mcp");
    warp::serve(mcp_route).run(([127, 0, 0, 1], 3000)).await;
}

fn init_tools() -> HashMap<String, Tool> {
    let mut tools = HashMap::new();
    
    tools.insert("run_terminal".to_string(), Tool {
        name: "run_terminal".to_string(),
        description: "Execute a command in the system terminal".to_string(),
        parameters: serde_json::json!({
            "type": "object",
            "properties": {
                "command": { "type": "string" }
            }
        }),
    });

    tools.insert("read_file".to_string(), Tool {
        name: "read_file".to_string(),
        description: "Read the contents of a file".to_string(),
        parameters: serde_json::json!({
            "type": "object",
            "properties": {
                "path": { "type": "string" }
            }
        }),
    });

    tools
}

async fn handle_mcp_request(
    req: McpRequest,
    state: Arc<Mutex<AppState>>,
) -> Result<impl warp::Reply, warp::Rejection> {
    let state = state.lock().await;

    let result = match req.method.as_str() {
        "list_tools" => Some(serde_json::to_value(&state.tools).unwrap()),
        "call_tool" => {
            let tool_name = req.params["name"].as_str().unwrap_or("");
            let args = &req.params["arguments"];
            
            match tool_name {
                "run_terminal" => execute_terminal(args),
                "read_file" => execute_read_file(args),
                _ => None,
            }
        }
        _ => None,
    };

    let response = McpResponse {
        jsonrpc: "2.0".to_string(),
        result,
        error: None,
        id: req.id,
    };

    Ok(warp::reply::json(&response))
}

fn execute_terminal(args: &serde_json::Value) -> Option<serde_json::Value> {
    let command = args["command"].as_str()?;
    println!("Executing terminal: {}", command);
    // Real implementation would use std::process::Command
    Some(serde_json::json!({ "output": format!("Simulated output for: {}", command) }))
}

fn execute_read_file(args: &serde_json::Value) -> Option<serde_json::Value> {
    let path = args["path"].as_str()?;
    println!("Reading file: {}", path);
    // Real implementation would use std::fs::read_to_string
    Some(serde_json::json!({ "content": format!("Simulated content for: {}", path) }))
}
