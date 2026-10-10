-- Moon Loader · usemoon.pro
-- This file runs inside a Roblox Lua runtime, not a web browser.
-- User keys are entered in the game UI and are never sent to usemoon.pro.

local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")
local CoreGui = game:GetService("CoreGui")
local player = Players.LocalPlayer

if not player then
    warn("[moon] LocalPlayer is unavailable")
    return
end

local scripts = {
    { name = "Death Ball", id = "c12d7a4a94f0d10c27f21ff462e781d5" },
    { name = "Retro Tower Defense", id = "3c8cbc7e049bf4f49bac804b6d20b337" },
    { name = "Silly Defense", id = "2c7eb16a08c32a940d6df4fedceae130" },
    { name = "Violence District", id = "b64eaf788b0c15c54c17ee96a133bc7a" },
    { name = "Basketball Zero", id = "9dd3ccd48c3e87b1a223d0a175fc6876" },
    { name = "Sound Space", id = "e8eb78843c7babd4c1cf673c832ed54a" },
    { name = "Last Contract (Tower Defense)", id = "6aff1732647e82be5eeb8ebb108710a1" }
}

local function new(className, props, parent)
    local instance = Instance.new(className)
    for key, value in pairs(props or {}) do
        instance[key] = value
    end
    instance.Parent = parent
    return instance
end

local background = Color3.fromRGB(15, 16, 23)
local panelColor = Color3.fromRGB(25, 26, 36)
local accent = Color3.fromRGB(121, 121, 255)
local foreground = Color3.fromRGB(245, 245, 250)
local muted = Color3.fromRGB(161, 162, 179)
local green = Color3.fromRGB(34, 197, 94)

local parent = player:WaitForChild("PlayerGui")

if type(gethui) == "function" then
    local ok, uiParent = pcall(gethui)
    if ok and typeof(uiParent) == "Instance" then
        parent = uiParent
    end
end

local previous = parent:FindFirstChild("MoonLoader")
if previous then
    previous:Destroy()
end

local gui = new("ScreenGui", {
    Name = "MoonLoader",
    ResetOnSpawn = false,
    IgnoreGuiInset = true,
    DisplayOrder = 19000,
    ZIndexBehavior = Enum.ZIndexBehavior.Sibling
}, parent)

local viewport = workspace.CurrentCamera and workspace.CurrentCamera.ViewportSize
    or Vector2.new(620, 760)

local width = math.min(560, math.max(290, viewport.X - 24))
local height = math.min(580, math.max(400, viewport.Y - 30))

local container = new("Frame", {
    Name = "Window",
    AnchorPoint = Vector2.new(0.5, 0.5),
    Position = UDim2.fromScale(0.5, 0.5),
    Size = UDim2.fromOffset(width, height),
    BackgroundColor3 = background,
    BorderSizePixel = 0
}, gui)
new("UICorner", { CornerRadius = UDim.new(0, 17) }, container)
new("UIStroke", { Color = Color3.fromRGB(55, 56, 76), Thickness = 1 }, container)

new("TextLabel", {
    Position = UDim2.fromOffset(20, 13),
    Size = UDim2.new(1, -80, 0, 32),
    BackgroundTransparency = 1,
    Text = "moon  /  Loader",
    Font = Enum.Font.GothamBold,
    TextSize = 22,
    TextColor3 = foreground,
    TextXAlignment = Enum.TextXAlignment.Left
}, container)

new("TextLabel", {
    Position = UDim2.fromOffset(20, 44),
    Size = UDim2.new(1, -40, 0, 19),
    BackgroundTransparency = 1,
    Text = "Choose a script, enter your Luarmor key, then launch.",
    Font = Enum.Font.Gotham,
    TextSize = 11,
    TextColor3 = muted,
    TextXAlignment = Enum.TextXAlignment.Left
}, container)

local close = new("TextButton", {
    Position = UDim2.new(1, -48, 0, 15),
    Size = UDim2.fromOffset(31, 31),
    Text = "×",
    Font = Enum.Font.GothamBold,
    TextSize = 22,
    TextColor3 = foreground,
    BackgroundColor3 = panelColor,
    BorderSizePixel = 0
}, container)
new("UICorner", { CornerRadius = UDim.new(0, 8) }, close)
close.Activated:Connect(function()
    gui:Destroy()
end)

local listHeight = math.max(160, height - 259)
local list = new("ScrollingFrame", {
    Name = "ScriptList",
    Position = UDim2.fromOffset(16, 78),
    Size = UDim2.new(1, -32, 0, listHeight),
    BackgroundColor3 = Color3.fromRGB(19, 20, 28),
    BorderSizePixel = 0,
    ScrollBarThickness = 4,
    ScrollBarImageColor3 = accent,
    CanvasSize = UDim2.new(0, 0, 0, 0),
    AutomaticCanvasSize = Enum.AutomaticSize.Y
}, container)
new("UICorner", { CornerRadius = UDim.new(0, 10) }, list)
new("UIPadding", {
    PaddingTop = UDim.new(0, 7),
    PaddingBottom = UDim.new(0, 7),
    PaddingLeft = UDim.new(0, 7),
    PaddingRight = UDim.new(0, 7)
}, list)
new("UIListLayout", {
    Padding = UDim.new(0, 5),
    FillDirection = Enum.FillDirection.Vertical,
    SortOrder = Enum.SortOrder.LayoutOrder
}, list)

local selectedIndex = 1
local buttons = {}

local function renderSelection()
    for index, button in ipairs(buttons) do
        local isSelected = index == selectedIndex
        button.BackgroundColor3 = isSelected and
            Color3.fromRGB(51, 48, 100) or panelColor
        button.TextColor3 = isSelected and foreground or muted
    end
end

for index, item in ipairs(scripts) do
    local button = new("TextButton", {
        Name = "Script" .. index,
        LayoutOrder = index,
        Size = UDim2.new(1, 0, 0, 38),
        BorderSizePixel = 0,
        BackgroundColor3 = panelColor,
        TextColor3 = muted,
        Text = "  " .. item.name,
        Font = Enum.Font.GothamMedium,
        TextSize = 13,
        TextXAlignment = Enum.TextXAlignment.Left,
        AutoButtonColor = false
    }, list)
    new("UICorner", { CornerRadius = UDim.new(0, 7) }, button)

    button.Activated:Connect(function()
        selectedIndex = index
        renderSelection()
    end)

    table.insert(buttons, button)
end

renderSelection()

new("TextLabel", {
    Position = UDim2.new(0, 20, 0, 88 + listHeight),
    Size = UDim2.new(1, -40, 0, 22),
    BackgroundTransparency = 1,
    Text = "LUARMOR KEY",
    Font = Enum.Font.GothamBold,
    TextSize = 11,
    TextColor3 = muted,
    TextXAlignment = Enum.TextXAlignment.Left
}, container)

local globalEnv = (type(getgenv) == "function" and getgenv()) or _G
local initialKey = type(globalEnv.script_key) == "string" and globalEnv.script_key or ""

local keyBox = new("TextBox", {
    Name = "LuarmorKey",
    Position = UDim2.new(0, 20, 0, 111 + listHeight),
    Size = UDim2.new(1, -40, 0, 39),
    BackgroundColor3 = panelColor,
    BorderSizePixel = 0,
    ClearTextOnFocus = false,
    Text = initialKey,
    PlaceholderText = "Enter your 32-character key...",
    PlaceholderColor3 = Color3.fromRGB(125, 126, 140),
    Font = Enum.Font.Code,
    TextSize = 13,
    TextColor3 = foreground,
    TextXAlignment = Enum.TextXAlignment.Left
}, container)
new("UICorner", { CornerRadius = UDim.new(0, 8) }, keyBox)
new("UIPadding", { PaddingLeft = UDim.new(0, 12), PaddingRight = UDim.new(0, 12) }, keyBox)

local statusText = new("TextLabel", {
    Name = "Status",
    Position = UDim2.new(0, 20, 0, 154 + listHeight),
    Size = UDim2.new(1, -40, 0, 31),
    BackgroundTransparency = 1,
    Text = "Select a script and enter a key.",
    Font = Enum.Font.Gotham,
    TextSize = 11,
    TextWrapped = true,
    TextColor3 = muted,
    TextXAlignment = Enum.TextXAlignment.Left,
    TextYAlignment = Enum.TextYAlignment.Center
}, container)

local launchButton = new("TextButton", {
    Name = "Launch",
    Position = UDim2.new(0, 20, 1, -58),
    Size = UDim2.new(1, -40, 0, 42),
    BackgroundColor3 = accent,
    BorderSizePixel = 0,
    Text = "Load selected script",
    Font = Enum.Font.GothamBold,
    TextSize = 14,
    TextColor3 = foreground
}, container)
new("UICorner", { CornerRadius = UDim.new(0, 9) }, launchButton)

local busy = false

local statusMessages = {
    KEY_EXPIRED = "Your key has expired.",
    KEY_BANNED = "This key has been banned.",
    KEY_HWID_LOCKED = "Key linked to another HWID. Reset it in the Luarmor panel.",
    KEY_INCORRECT = "Key incorrect or deleted.",
    KEY_INVALID = "Key format is invalid.",
    SCRIPT_ID_INCORRECT = "Script ID not found in Luarmor.",
    SCRIPT_ID_INVALID = "Script ID format is invalid.",
    INVALID_EXECUTOR = "Unsupported executor.",
    SECURITY_ERROR = "Luarmor security verification failed.",
    TIME_ERROR = "Client time is invalid.",
    UNKNOWN_ERROR = "Luarmor is temporarily unavailable."
}

local function setStatus(message, color)
    statusText.Text = tostring(message)
    statusText.TextColor3 = color or muted
end

launchButton.Activated:Connect(function()
    if busy then
        return
    end

    local key = (keyBox.Text or ""):gsub("%s+", "")

    if #key ~= 32 then
        setStatus("Enter a valid 32-character Luarmor key.", Color3.fromRGB(255, 129, 137))
        return
    end

    busy = true
    launchButton.Text = "Checking key..."
    launchButton.BackgroundColor3 = Color3.fromRGB(74, 76, 108)
    setStatus("Checking your key with Luarmor...", accent)

    task.spawn(function()
        local ok, api = pcall(function()
            return loadstring(
                game:HttpGet("https://sdkapi-public.luarmor.net/library.lua")
            )()
        end)

        if not ok or type(api) ~= "table" then
            setStatus("Failed to load Luarmor SDK.", Color3.fromRGB(255, 129, 137))
        else
            api.script_id = scripts[selectedIndex].id

            local checked, status = pcall(function()
                return api.check_key(key)
            end)

            if not checked or type(status) ~= "table" then
                setStatus("Key check request failed.", Color3.fromRGB(255, 129, 137))
            elseif status.code ~= "KEY_VALID" then
                local message = statusMessages[status.code]
                    or status.message
                    or ("Luarmor: " .. tostring(status.code))
                setStatus(message, Color3.fromRGB(255, 129, 137))
            else
                -- This must be set in the Roblox runtime before load_script().
                globalEnv.script_key = key
                _G.script_key = key
                script_key = key

                setStatus("Key valid. Loading " .. scripts[selectedIndex].name .. "...", green)

                local launched, reason = pcall(function()
                    api.load_script()
                end)

                if launched then
                    setStatus("Script loaded successfully.", green)
                else
                    setStatus("Load failed: " .. tostring(reason), Color3.fromRGB(255, 129, 137))
                end
            end
        end

        busy = false
        launchButton.Text = "Load selected script"
        launchButton.BackgroundColor3 = accent
    end)
end)

-- Avoid an unused-service warning in analyzers that check this file.
-- The GUI uses Activated, which works with both mouse and touch input.
