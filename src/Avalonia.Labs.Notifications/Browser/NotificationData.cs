#if BROWSER
using System.Text.Json.Serialization;

namespace Avalonia.Labs.Notifications.Browser;

[JsonSerializable(typeof(NotificationOptions))]
[JsonSerializable(typeof(NotificationAction))]
[JsonSerializable(typeof(NotificationData))]
[JsonSerializable(typeof(Data))]
[JsonSerializable(typeof(InnerData))]
[JsonSerializable(typeof(ReplyData))]
internal partial class NotificationJsonContext : JsonSerializerContext
{
}

internal class NotificationOptions
{
    public string? Body { get; set; }
    public string? Icon { get; set; }
    public string? Badge { get; set; }
    public string? Tag { get; set; }
    public bool RequireInteraction { get; set; }
    public NotificationData? Data { get; set; }
    public int[] Vibrations { get; set; } = [];
    public NotificationAction[] Actions { get; set; } = [];
}

internal class NotificationAction
{
    public string? Title { get; set; }
    public string? Type { get; set; }
    public string? Action { get; set; }

    public string? Icon { get; set; }
}

internal class NotificationData
{
    public required uint Id { get; set; }
    public string? ReplyActionTag { get; set; }
}

class Data
{
    public string? action { get; set; }
    public InnerData? data { get; set; }
}

class InnerData
{
    public uint? id { get; set; }
}

class ReplyData : Data
{
    public string? Reply { get; set; }
}
#endif
