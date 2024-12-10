events = app.stream(
#     {"messages": [("user", user_input)]}, stream_mode="values"
# )
# for event in events:
#     event["messages"][-1].pretty_print()