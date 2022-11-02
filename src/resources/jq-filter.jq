walk(
    if type == "object" then
        with_entries(
            select(
                (.value != null and .key != "sensitive" and .key != "terraform" and .key != "provider")
                and
                (.key | test("\/\/") | not)
            )
        )
    else
        .
    end
)
