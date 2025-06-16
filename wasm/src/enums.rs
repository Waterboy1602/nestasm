pub enum Status {
    Idle,
    Start,
    Processing,
    Finished,
    Error,
}

impl std::fmt::Display for Status {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let s = match self {
            Status::Idle => "idle",
            Status::Start => "start",
            Status::Processing => "processing",
            Status::Finished => "finished",
            Status::Error => "error",
        };
        write!(f, "{s}")
    }
}
