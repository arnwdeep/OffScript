import os
import sys
import wave
import math
import subprocess
from PIL import Image, ImageDraw, ImageFont
import imageio_ffmpeg

# Paths
FFMPEG_BIN = imageio_ffmpeg.get_ffmpeg_exe()
OUTPUT_VIDEO = "offscript_live_demo.mp4"
CONCAT_AUDIO = "demo_full_voiceover.wav"

FONT_BOLD_PATH = "C:\\Windows\\Fonts\\segoeuib.ttf"
FONT_REG_PATH = "C:\\Windows\\Fonts\\segoeui.ttf"

FPS = 24
WIDTH = 1920
HEIGHT = 1080

def get_font(size, bold=False):
    path = FONT_BOLD_PATH if bold else FONT_REG_PATH
    try:
        return ImageFont.truetype(path, size)
    except:
        return ImageFont.load_default()

# Audio scenes
SCENES_AUDIO = [
    ("scene1_intro.wav", "Scene 1: Intro & Tactile Macro Keypad"),
    ("scene2_connect.wav", "Scene 2: White Interface — Direct Link & Channel Connection"),
    ("scene3_library.wav", "Scene 3: Peach Interface — Published Videos Library"),
    ("scene4_gaps.wav", "Scene 4: Purple Interface — Audience Intelligence & Gaps"),
    ("scene5_studio.wav", "Scene 5: Yellow Interface — Short-Form Clip Studio & Auto-Post"),
    ("scene6_brand.wav", "Scene 6: Blue Interface — Brand Voice & Creator Memory"),
    ("scene7_outro.wav", "Scene 7: Outro & Summary")
]

# Concatenate all wav files into one master audio track
def concat_audio_files(scene_list, out_path):
    data = []
    params = None
    durations = []
    for fn, _ in scene_list:
        with wave.open(fn, 'rb') as w:
            if params is None:
                params = w.getparams()
            dur = w.getnframes() / float(w.getframerate())
            durations.append(dur)
            data.append(w.readframes(w.getnframes()))
    with wave.open(out_path, 'wb') as out:
        out.setparams(params)
        for d in data:
            out.writeframes(d)
    return durations

print("Concatenating voiceover audio tracks...")
durations = concat_audio_files(SCENES_AUDIO, CONCAT_AUDIO)
for (fn, name), d in zip(SCENES_AUDIO, durations):
    print(f"  {name}: {d:.2f}s ({int(d * FPS)} frames)")

total_duration = sum(durations)
total_frames = int(total_duration * FPS)
print(f"Total video duration: {total_duration:.2f}s ({total_frames} frames at {FPS} fps)")

# Preload assets
keypad_base_raw = Image.open("Glossy Macro Keypad Interface.png").convert("RGBA")
logo_raw = Image.open("logo.png").convert("RGBA")

# Load real thumbnails
thumbs = []
for i in range(6):
    tp = os.path.join("demo_assets", f"thumb_{i}.jpg")
    if os.path.exists(tp):
        thumbs.append(Image.open(tp).convert("RGB"))
    else:
        thumbs.append(Image.new("RGB", (320, 180), (30, 30, 30)))

# Utility: round rectangle
def draw_card(draw, bbox, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(bbox, radius=radius, fill=fill, outline=outline, width=width)

# Camera transform
def apply_camera(img, cx, cy, zoom):
    if abs(zoom - 1.0) < 0.005:
        return img
    w, h = img.size
    crop_w = int(w / zoom)
    crop_h = int(h / zoom)
    x0 = int(cx - crop_w / 2)
    y0 = int(cy - crop_h / 2)
    x0 = max(0, min(x0, w - crop_w))
    y0 = max(0, min(y0, h - crop_h))
    cropped = img.crop((x0, y0, x0 + crop_w, y0 + crop_h))
    return cropped.resize((w, h), Image.Resampling.BILINEAR)

# Lower third banner
def draw_lower_third(draw, main_title, category_text):
    pill_w, pill_h = 960, 56
    pill_x = (WIDTH - pill_w) // 2
    pill_y = HEIGHT - 84
    draw_card(draw, (pill_x, pill_y, pill_x + pill_w, pill_y + pill_h), 28, (14, 16, 22), (255, 255, 255, 40), 1)
    
    # Red live record dot
    draw.ellipse((pill_x + 20, pill_y + 22, pill_x + 32, pill_y + 34), fill=(239, 68, 68))
    
    f_cat = get_font(12, bold=True)
    f_main = get_font(15, bold=True)
    draw.text((pill_x + 44, pill_y + 19), category_text.upper(), font=f_cat, fill=(160, 175, 200))
    draw.text((pill_x + 290, pill_y + 19), "|  " + main_title, font=f_main, fill=(255, 255, 255))

# Header for interfaces
def draw_app_header(draw, active_tab, dot_color, theme_tag, title_text, bg_header, text_color):
    draw.rectangle((0, 0, WIDTH, 72), fill=bg_header)
    draw.line((0, 72, WIDTH, 72), fill=(0, 0, 0, 25), width=1)
    
    # Left: Return to Keypad button
    btn_w, btn_h = 160, 42
    btn_x, btn_y = 48, 15
    draw_card(draw, (btn_x, btn_y, btn_x + btn_w, btn_y + btn_h), 21, (17, 19, 21), outline=None)
    f_btn = get_font(13, bold=True)
    draw.text((btn_x + 20, btn_y + 11), "<  Macro Keypad", font=f_btn, fill=(255, 255, 255))
    
    # Logo & Brand name
    logo_thumb = logo_raw.resize((36, 36), Image.Resampling.LANCZOS)
    # We will paste logo on canvas directly in caller
    f_brand = get_font(17, bold=True)
    f_sub = get_font(10, bold=True)
    draw.text((270, 16), "Off Script", font=f_brand, fill=text_color)
    draw.text((270, 39), "CREATOR MEMORY & STUDIO", font=f_sub, fill=(130, 140, 160))
    
    # Center: Workspace Badge
    b_w = 460
    b_x = (WIDTH - b_w) // 2
    b_y = 15
    draw_card(draw, (b_x, b_y, b_x + b_w, b_y + 42), 21, (255, 255, 255), outline=(0, 0, 0, 40), width=1)
    draw.ellipse((b_x + 18, b_y + 16, b_x + 28, b_y + 26), fill=dot_color)
    f_tag = get_font(11, bold=True)
    f_t = get_font(13, bold=True)
    draw.text((b_x + 36, b_y + 13), theme_tag, font=f_tag, fill=dot_color)
    draw.text((b_x + 175, b_y + 13), "*  " + title_text, font=f_t, fill=(30, 41, 59))
    
    # Right: Connected channel indicator
    c_w = 210
    c_x = WIDTH - c_w - 48
    draw_card(draw, (c_x, 15, c_x + c_w, 57), 21, (34, 197, 94, 30), outline=(34, 197, 94, 90), width=1)
    draw.ellipse((c_x + 16, 26, c_x + 26, 36), fill=(34, 197, 94))
    f_c = get_font(12, bold=True)
    draw.text((c_x + 34, 21), "@fireship (12 videos)", font=f_c, fill=(22, 101, 52))

# =========================================================================
# SCENE RENDERERS
# =========================================================================

# Scene 1: Homepage & Tactile Keypad
def render_scene_1(progress):
    im = Image.new("RGB", (WIDTH, HEIGHT), (0, 0, 0))
    draw = ImageDraw.Draw(im)
    
    # Camera zoom: from 1.05 to 1.35
    zoom = 1.05 + 0.30 * (progress ** 1.4)
    
    # Draw keypad base
    kw, kh = 480, int(480 * (1403 / 1121))
    kx = (WIDTH - kw) // 2
    ky = (HEIGHT - kh) // 2 + 10
    
    kp_resized = keypad_base_raw.resize((kw, kh), Image.Resampling.LANCZOS)
    im.paste(kp_resized, (kx, ky), kp_resized)
    
    # Draw OLED screen content
    oled_x = kx + int(kw * 0.17)
    oled_y = ky + int(kh * 0.132)
    oled_w = int(kw * 0.66)
    oled_h = int(kh * 0.202)
    
    draw_card(draw, (oled_x, oled_y, oled_x + oled_w, oled_y + oled_h), 10, (9, 10, 13))
    
    f_oled1 = get_font(18, bold=True)
    f_oled2 = get_font(14, bold=True)
    draw.text((oled_x + 24, oled_y + 20), "OFF SCRIPT", font=f_oled1, fill=(244, 244, 245))
    
    blink = int(progress * 30) % 2 == 0
    status_str = "> READY_" if blink else "> READY "
    if progress > 0.75:
        status_str = "> CONNECT ACCOUNTS"
    draw.text((oled_x + 24, oled_y + 54), status_str, font=f_oled2, fill=(34, 197, 94))
    
    # Key popping animation near end of scene
    if progress > 0.78:
        pop_amount = math.sin((progress - 0.78) / 0.22 * math.pi) * 16
        # Draw a highlighted popping ring around white keycap
        key1_cx = kx + int(kw * 0.28)
        key1_cy = ky + int(kh * 0.46) - int(pop_amount)
        draw.ellipse((key1_cx - 40, key1_cy - 40, key1_cx + 40, key1_cy + 40), outline=(255, 255, 255), width=3)
    
    # Top title
    f_head = get_font(32, bold=True)
    f_sub = get_font(15, bold=False)
    draw.text((WIDTH//2 - 240, 60), "OFF SCRIPT CREATOR STUDIO", font=f_head, fill=(255, 255, 255))
    draw.text((WIDTH//2 - 190, 105), "Tactile 5-Key Hardware Workstation Interface", font=f_sub, fill=(160, 175, 200))
    
    # Lower third
    draw_lower_third(draw, "5-KEY MACRO WORKSTATION | TACTILE POPPING & DYNAMIC OLED", "HOMEPAGE")
    
    return apply_camera(im, WIDTH//2, HEIGHT//2, zoom)

# Scene 2: White Interface (Connect & Direct Link)
def render_scene_2(progress):
    im = Image.new("RGB", (WIDTH, HEIGHT), (255, 255, 255))
    draw = ImageDraw.Draw(im)
    
    # Camera: zoom in on hero + youtube, then zoom back out
    if progress < 0.35:
        zoom = 1.0 + (progress / 0.35) * 0.28
        cx, cy = 960, 480
    elif progress < 0.75:
        zoom = 1.28
        cx, cy = 760, 450
    else:
        zoom = 1.28 - ((progress - 0.75) / 0.25) * 0.28
        cx, cy = 960, 540
    
    # Header
    draw_app_header(draw, "connect", (15, 23, 42), "WHITE INTERFACE", "Connect Accounts & Direct Link", (255, 255, 255), (15, 23, 42))
    logo_thumb = logo_raw.resize((36, 36), Image.Resampling.LANCZOS)
    im.paste(logo_thumb, (222, 18), logo_thumb)
    
    # Bento Block 1: Electric Blue Hero Card
    hero_x, hero_y, hero_w, hero_h = 160, 100, 1600, 290
    draw_card(draw, (hero_x, hero_y, hero_x + hero_w, hero_y + hero_h), 34, (29, 78, 216))
    
    # Hero badge
    draw_card(draw, (hero_x + 50, hero_y + 28, hero_x + 390, hero_y + 64), 18, (255, 255, 255, 50))
    f_badge = get_font(11, bold=True)
    draw.text((hero_x + 70, hero_y + 37), "* DIRECT VIDEO LINK & CLIP REPURPOSING", font=f_badge, fill=(255, 255, 255))
    
    # Hero Title & Subtitle
    f_ht = get_font(36, bold=True)
    f_hs = get_font(15, bold=False)
    draw.text((hero_x + 50, hero_y + 78), "Paste Any Video Link", font=f_ht, fill=(255, 255, 255))
    draw.text((hero_x + 50, hero_y + 128), "Instantly index content memory and cut vertical clips from any public YouTube or Instagram link.", font=f_hs, fill=(219, 234, 254))
    
    # Input box inside Hero
    in_x, in_y, in_w, in_h = hero_x + 50, hero_y + 168, 1500, 58
    draw_card(draw, (in_x, in_y, in_x + in_w, in_y + in_h), 29, (255, 255, 255))
    f_in = get_font(14, bold=True)
    draw.text((in_x + 24, in_y + 19), "https://www.youtube.com/watch?v=kqtD5dpn9C8 (Python in 100 Seconds)", font=f_in, fill=(15, 23, 42))
    
    # Button inside input box
    f_btn = get_font(13, bold=True)
    draw_card(draw, (in_x + in_w - 220, in_y + 7, in_x + in_w - 10, in_y + in_h - 7), 22, (17, 19, 21))
    draw.text((in_x + in_w - 200, in_y + 19), "Get Video & Cut Clips", font=f_btn, fill=(255, 255, 255))
    
    # Samples pills
    draw.text((hero_x + 50, hero_y + 246), "Quick test links:", font=get_font(12, bold=True), fill=(219, 234, 254))
    draw_card(draw, (hero_x + 160, hero_y + 240, hero_x + 340, hero_y + 270), 15, (255, 255, 255, 55))
    draw.text((hero_x + 175, hero_y + 246), "Python in 100 Seconds", font=get_font(11, bold=True), fill=(255, 255, 255))
    draw_card(draw, (hero_x + 355, hero_y + 240, hero_x + 560, hero_y + 270), 15, (255, 255, 255, 55))
    draw.text((hero_x + 370, hero_y + 246), "Neural Networks 3Blue1Brown", font=get_font(11, bold=True), fill=(255, 255, 255))
    
    # Bento Grid Row 2
    row2_y = 415
    col_w = 785
    
    # YouTube Mint Green Card (Left)
    yt_x = 160
    draw_card(draw, (yt_x, row2_y, yt_x + col_w, row2_y + 280), 34, (16, 185, 129))
    # Icon circle
    draw.ellipse((yt_x + 40, row2_y + 30, yt_x + 94, row2_y + 84), fill=(6, 78, 59))
    draw.text((yt_x + 56, row2_y + 44), ">", font=get_font(24, bold=True), fill=(16, 185, 129))
    draw.text((yt_x + 110, row2_y + 32), "YouTube Channel", font=get_font(22, bold=True), fill=(6, 78, 59))
    draw.text((yt_x + 110, row2_y + 62), "Sync all published videos by Channel ID or Handle", font=get_font(13, bold=True), fill=(2, 44, 34))
    
    # Input row
    draw.text((yt_x + 40, row2_y + 105), "CHANNEL HANDLE OR ID", font=get_font(11, bold=True), fill=(6, 78, 59))
    draw_card(draw, (yt_x + 40, row2_y + 130, yt_x + col_w - 40, row2_y + 180), 25, (255, 255, 255))
    
    # Typing animation for fireship
    typed_text = "@fireship" if progress > 0.40 else "@fire" if progress > 0.25 else "@"
    draw.text((yt_x + 60, row2_y + 144), typed_text, font=get_font(14, bold=True), fill=(15, 23, 42))
    draw_card(draw, (yt_x + col_w - 200, row2_y + 135, yt_x + col_w - 45, row2_y + 175), 20, (17, 19, 21))
    draw.text((yt_x + col_w - 180, row2_y + 145), "Connect & Sync", font=get_font(12, bold=True), fill=(255, 255, 255))
    
    # Quick chips
    for idx, name in enumerate(["@fireship", "@mkbhd", "@veritasium"]):
        cx_pos = yt_x + 40 + idx * 115
        draw_card(draw, (cx_pos, row2_y + 205, cx_pos + 100, row2_y + 235), 15, (6, 78, 59, 40))
        draw.text((cx_pos + 15, row2_y + 213), name, font=get_font(11, bold=True), fill=(6, 78, 59))
        
    # Instagram Jet Black Card (Right)
    ig_x = 975
    draw_card(draw, (ig_x, row2_y, ig_x + col_w, row2_y + 280), 34, (17, 19, 21))
    draw.ellipse((ig_x + 40, row2_y + 30, ig_x + 94, row2_y + 84), fill=(30, 32, 37))
    draw.text((ig_x + 110, row2_y + 32), "Instagram Account", font=get_font(22, bold=True), fill=(255, 255, 255))
    draw.text((ig_x + 110, row2_y + 62), "Sync your Reels and Posts with your Instagram handle", font=get_font(13, bold=False), fill=(148, 163, 184))
    
    draw.text((ig_x + 40, row2_y + 105), "INSTAGRAM USERNAME / HANDLE", font=get_font(11, bold=True), fill=(148, 163, 184))
    draw_card(draw, (ig_x + 40, row2_y + 130, ig_x + col_w - 40, row2_y + 180), 25, (30, 32, 37), outline=(255, 255, 255, 30))
    draw.text((ig_x + 60, row2_y + 144), "@creators", font=get_font(14, bold=False), fill=(255, 255, 255))
    draw_card(draw, (ig_x + col_w - 180, row2_y + 135, ig_x + col_w - 45, row2_y + 175), 20, (139, 92, 246))
    draw.text((ig_x + col_w - 160, row2_y + 145), "Connect ID", font=get_font(12, bold=True), fill=(255, 255, 255))
    
    # Bento Grid Row 3: Golden Yellow Handles Bar
    row3_y = 720
    draw_card(draw, (160, row3_y, 160 + 1600, row3_y + 130), 34, (251, 191, 36))
    draw.text((200, row3_y + 20), "* SUPPORTED CREATOR PLATFORMS & HANDLES", font=get_font(12, bold=True), fill=(120, 53, 15))
    
    # Handle pills
    p_names = ["YouTube @channel", "Instagram @profile", "TikTok @handle", "X @creator", "LinkedIn Creator"]
    for i, pn in enumerate(p_names):
        px = 200 + i * 280
        draw_card(draw, (px, row3_y + 55, px + 250, row3_y + 100), 22, (17, 19, 21))
        draw.text((px + 24, row3_y + 68), pn, font=get_font(13, bold=True), fill=(255, 255, 255))
        
    draw_lower_third(draw, "WHITE INTERFACE • DIRECT VIDEO LINK & CHANNEL SYNC", "MODULE 1")
    return apply_camera(im, cx, cy, zoom)

# Scene 3: Peach Interface (Videos Library)
def render_scene_3(progress):
    im = Image.new("RGB", (WIDTH, HEIGHT), (255, 240, 234)) # Peach background
    draw = ImageDraw.Draw(im)
    
    # Camera zoom: moves into video grid then player
    if progress < 0.40:
        zoom = 1.0 + (progress / 0.40) * 0.25
        cx, cy = 600, 520
    elif progress < 0.80:
        zoom = 1.25
        cx, cy = 1100, 520
    else:
        zoom = 1.25 - ((progress - 0.80) / 0.20) * 0.25
        cx, cy = 960, 540
        
    # Header
    draw_app_header(draw, "library", (255, 107, 74), "PEACH INTERFACE", "Published Videos Library", (255, 229, 217), (67, 20, 7))
    logo_thumb = logo_raw.resize((36, 36), Image.Resampling.LANCZOS)
    im.paste(logo_thumb, (222, 18), logo_thumb)
    
    # Top Coral Sync Bar Card
    sync_w, sync_h = 1600, 110
    sync_x, sync_y = 160, 95
    draw_card(draw, (sync_x, sync_y, sync_x + sync_w, sync_y + sync_h), 34, (255, 107, 74))
    draw.text((sync_x + 40, sync_y + 20), "* SYNC LIBRARY WITH SOCIAL ID", font=get_font(12, bold=True), fill=(255, 255, 255))
    draw.text((sync_x + 40, sync_y + 45), "All 12 actual videos from Fireship loaded into searchable memory", font=get_font(15, bold=False), fill=(255, 228, 220))
    # Platform pills
    draw_card(draw, (sync_x + sync_w - 380, sync_y + 30, sync_x + sync_w - 200, sync_y + 75), 22, (255, 255, 255))
    draw.text((sync_x + sync_w - 355, sync_y + 44), "YouTube Channel", font=get_font(12, bold=True), fill=(255, 107, 74))
    draw_card(draw, (sync_x + sync_w - 180, sync_y + 30, sync_x + sync_w - 40, sync_y + 75), 22, (17, 19, 21))
    draw.text((sync_x + sync_w - 150, sync_y + 44), "Instagram", font=get_font(12, bold=True), fill=(255, 255, 255))

    # Widescreen 2-Column Workstation Layout
    row_y = 230
    # Left Column: Jet Black Synced Videos List
    list_w, list_h = 680, 680
    list_x = 160
    draw_card(draw, (list_x, row_y, list_x + list_w, row_y + list_h), 34, (17, 19, 21))
    draw_card(draw, (list_x, row_y, list_x + list_w, row_y + 65), 34, (24, 26, 31))
    draw.text((list_x + 35, row_y + 22), "Synced Videos (@fireship)", font=get_font(16, bold=True), fill=(255, 255, 255))
    draw_card(draw, (list_x + list_w - 140, row_y + 16, list_x + list_w - 30, row_y + 48), 16, (255, 107, 74))
    draw.text((list_x + list_w - 120, row_y + 24), "12 videos", font=get_font(11, bold=True), fill=(255, 255, 255))
    
    # 4 Video Items
    video_titles = [
        ("Did the AI bubble just pop?", "05:25", "2.1M views"),
        ("China just dropped a new frontier model...", "06:26", "2.2M views"),
        ("The runtime wars are over... and Node won", "05:40", "1.2M views"),
        ("The most vulnerable week in internet history...", "06:04", "1.8M views")
    ]
    
    for i, (vt, vd, vv) in enumerate(video_titles):
        vy = row_y + 80 + i * 140
        is_sel = (i == 0)
        card_bg = (40, 44, 55) if is_sel else (24, 26, 31)
        draw_card(draw, (list_x + 20, vy, list_x + list_w - 20, vy + 125), 20, card_bg, outline=(255, 107, 74) if is_sel else None, width=2)
        
        # Paste thumbnail
        t_img = thumbs[i].resize((160, 95), Image.Resampling.LANCZOS)
        im.paste(t_img, (list_x + 35, vy + 15))
        
        # Duration tag on thumbnail
        draw_card(draw, (list_x + 130, vy + 85, list_x + 185, vy + 105), 4, (0, 0, 0, 200))
        draw.text((list_x + 138, vy + 88), vd, font=get_font(9, bold=True), fill=(251, 191, 36))
        
        # Title and meta
        f_vt = get_font(13, bold=True)
        draw.text((list_x + 215, vy + 25), vt[:38] + ("..." if len(vt) > 38 else ""), font=f_vt, fill=(255, 255, 255))
        draw.text((list_x + 215, vy + 55), f"YouTube * {vv} * Indexed", font=get_font(11, bold=False), fill=(148, 163, 184))
        
        if is_sel:
            draw_card(draw, (list_x + 215, vy + 85, list_x + 360, vy + 110), 12, (255, 107, 74, 40))
            draw.text((list_x + 225, vy + 90), "Streaming in Player", font=get_font(10, bold=True), fill=(255, 107, 74))

    # Right Column: Video Inspector & Memory Segments
    view_x = 870
    view_w = 890
    draw_card(draw, (view_x, row_y, view_x + view_w, row_y + list_h), 34, (255, 255, 255), outline=(255, 107, 74, 60), width=1)
    draw_card(draw, (view_x, row_y, view_x + view_w, row_y + 65), 34, (255, 239, 234))
    draw.text((view_x + 35, row_y + 22), "Did the AI bubble just pop?", font=get_font(16, bold=True), fill=(67, 20, 7))
    
    # 16:9 Video Canvas
    p_x = view_x + 35
    p_y = row_y + 90
    p_w = view_w - 70
    p_h = 320
    # Paste real thumbnail in player canvas
    thumb_large = thumbs[0].resize((p_w, p_h), Image.Resampling.LANCZOS)
    im.paste(thumb_large, (p_x, p_y))
    # Play icon bubble
    draw.ellipse((p_x + p_w//2 - 35, p_y + p_h//2 - 35, p_x + p_w//2 + 35, p_y + p_h//2 + 35), fill=(0, 0, 0, 180))
    draw.text((p_x + p_w//2 - 10, p_y + p_h//2 - 18), ">", font=get_font(30, bold=True), fill=(255, 255, 255))
    
    # Indexed Chapters & Memory Segments
    seg_y = p_y + p_h + 20
    draw_card(draw, (p_x, seg_y, p_x + p_w, seg_y + 200), 24, (255, 245, 240), outline=(255, 107, 74, 40), width=1)
    draw.text((p_x + 25, seg_y + 15), "INDEXED CHAPTERS & MOMENTS (CREATOR RECALL)", font=get_font(11, bold=True), fill=(194, 65, 12))
    
    chapters = [
        ("[00:00] The Core Shift & Market Reality", "High retention hook"),
        ("[01:10] The Breakthrough Principle", "Key value moment"),
        ("[02:15] The Trap Most Developers Fall Into", "Actionable lesson")
    ]
    for ci, (c_time, c_tag) in enumerate(chapters):
        cy_pos = seg_y + 45 + ci * 48
        draw_card(draw, (p_x + 20, cy_pos, p_x + p_w - 20, cy_pos + 40), 12, (255, 255, 255))
        draw.text((p_x + 35, cy_pos + 12), c_time, font=get_font(12, bold=True), fill=(67, 20, 7))
        draw.text((p_x + p_w - 180, cy_pos + 12), c_tag, font=get_font(11, bold=False), fill=(194, 65, 12))

    draw_lower_third(draw, "PEACH INTERFACE • VIDEOS LIBRARY | REAL YOUTUBE VIDEOS & CHAPTER MEMORY", "MODULE 2")
    return apply_camera(im, cx, cy, zoom)

# Scene 4: Purple Interface (Audience Gaps)
def render_scene_4(progress):
    im = Image.new("RGB", (WIDTH, HEIGHT), (245, 238, 255)) # Purple background
    draw = ImageDraw.Draw(im)
    
    zoom = 1.0 + math.sin(progress * math.pi) * 0.22
    cx, cy = 960, 520
    
    # Header
    draw_app_header(draw, "gaps", (139, 92, 246), "PURPLE INTERFACE", "Audience Intelligence & Content Gaps", (237, 228, 255), (46, 16, 101))
    logo_thumb = logo_raw.resize((36, 36), Image.Resampling.LANCZOS)
    im.paste(logo_thumb, (222, 18), logo_thumb)
    
    # Formula Banner (Mint Green)
    f_w, f_h = 1600, 90
    f_x, f_y = 160, 105
    draw_card(draw, (f_x, f_y, f_x + f_w, f_y + f_h), 28, (16, 185, 129))
    draw.text((f_x + 40, f_y + 18), "* AI OPPORTUNITY FORMULA", font=get_font(11, bold=True), fill=(6, 78, 59))
    draw.text((f_x + 40, f_y + 42), "Opportunity Score = Audience Demand x (1 - Library Coverage) | Derived from viewer comments", font=get_font(16, bold=True), fill=(2, 44, 34))
    
    # 2 Big Content Gap Bento Cards (Jet Black)
    gap_w = 780
    gap_h = 600
    
    # Card 1 (Left - High Opportunity)
    c1_x = 160
    c_y = 225
    draw_card(draw, (c1_x, c_y, c1_x + gap_w, c_y + gap_h), 34, (17, 19, 21))
    
    # Golden Yellow Score Pill
    draw_card(draw, (c1_x + 40, c_y + 35, c1_x + 280, c_y + 80), 22, (251, 191, 36))
    draw.text((c1_x + 55, c_y + 48), "OPPORTUNITY SCORE: 73", font=get_font(12, bold=True), fill=(69, 26, 3))
    
    draw.text((c1_x + 40, c_y + 105), "Deep Dive Follow-Up on AI Bubble Topic", font=get_font(20, bold=True), fill=(255, 255, 255))
    
    # Stats Bar
    draw_card(draw, (c1_x + 40, c_y + 155, c1_x + gap_w - 40, c_y + 225), 20, (30, 32, 37))
    draw.text((c1_x + 65, c_y + 172), "89%", font=get_font(18, bold=True), fill=(34, 197, 94))
    draw.text((c1_x + 65, c_y + 195), "Audience Demand", font=get_font(11, bold=False), fill=(148, 163, 184))
    
    draw.text((c1_x + 270, c_y + 172), "18%", font=get_font(18, bold=True), fill=(251, 191, 36))
    draw.text((c1_x + 270, c_y + 195), "Library Coverage", font=get_font(11, bold=False), fill=(148, 163, 184))
    
    draw.text((c1_x + 480, c_y + 172), "178 Requests", font=get_font(18, bold=True), fill=(139, 92, 246))
    draw.text((c1_x + 480, c_y + 195), "Unmet in Comments", font=get_font(11, bold=False), fill=(148, 163, 184))
    
    # Evidence Quotes
    draw_card(draw, (c1_x + 40, c_y + 250, c1_x + gap_w - 40, c_y + 480), 20, (30, 32, 37))
    draw.text((c1_x + 65, c_y + 270), "AUDIENCE COMMENTS & EVIDENCE", font=get_font(11, bold=True), fill=(196, 181, 253))
    quotes = [
        "\"Can you do a part 2 breaking down the most common mistakes?\"",
        "\"Where can we find the exact architecture diagrams you mentioned?\"",
        "\"A 30-second summary of this workflow would be super helpful!\""
    ]
    for qi, q in enumerate(quotes):
        qy = c_y + 305 + qi * 55
        draw.line((c1_x + 65, qy, c1_x + 65, qy + 35), fill=(139, 92, 246), width=3)
        draw.text((c1_x + 80, qy + 8), q, font=get_font(12, bold=False), fill=(226, 232, 240))
        
    # Action Button
    draw_card(draw, (c1_x + 40, c_y + 510, c1_x + gap_w - 40, c_y + 565), 25, (139, 92, 246))
    draw.text((c1_x + 240, c_y + 528), "Send Opportunity to Clip Studio ->", font=get_font(14, bold=True), fill=(255, 255, 255))
    
    # Card 2 (Right)
    c2_x = 980
    draw_card(draw, (c2_x, c_y, c2_x + gap_w, c_y + gap_h), 34, (17, 19, 21))
    draw_card(draw, (c2_x + 40, c_y + 35, c2_x + 280, c_y + 80), 22, (251, 191, 36))
    draw.text((c2_x + 55, c_y + 48), "OPPORTUNITY SCORE: 57", font=get_font(12, bold=True), fill=(69, 26, 3))
    draw.text((c2_x + 40, c_y + 105), "Step-by-Step Practical Workflow Guide", font=get_font(20, bold=True), fill=(255, 255, 255))
    draw_card(draw, (c2_x + 40, c_y + 155, c2_x + gap_w - 40, c_y + 225), 20, (30, 32, 37))
    draw.text((c2_x + 65, c_y + 172), "76% Demand", font=get_font(18, bold=True), fill=(34, 197, 94))
    draw.text((c2_x + 320, c_y + 172), "25% Coverage", font=get_font(18, bold=True), fill=(251, 191, 36))
    draw.text((c2_x + 560, c_y + 172), "115 Requests", font=get_font(18, bold=True), fill=(139, 92, 246))
    
    draw_card(draw, (c2_x + 40, c_y + 250, c2_x + gap_w - 40, c_y + 480), 20, (30, 32, 37))
    draw.text((c2_x + 65, c_y + 270), "TOP AUDIENCE REQUESTS", font=get_font(11, bold=True), fill=(196, 181, 253))
    draw.text((c2_x + 80, c_y + 310), "\"Could you show your exact setup step by step?\"", font=get_font(12, bold=False), fill=(226, 232, 240))
    draw.text((c2_x + 80, c_y + 365), "\"What would you do differently if starting over today?\"", font=get_font(12, bold=False), fill=(226, 232, 240))
    
    draw_card(draw, (c2_x + 40, c_y + 510, c2_x + gap_w - 40, c_y + 565), 25, (139, 92, 246))
    draw.text((c2_x + 240, c_y + 528), "Generate Clip Package for Topic ->", font=get_font(14, bold=True), fill=(255, 255, 255))
    
    draw_lower_third(draw, "PURPLE INTERFACE • AUDIENCE GAPS | AI OPPORTUNITY SCORES FROM REAL DEMAND", "MODULE 3")
    return apply_camera(im, cx, cy, zoom)

# Scene 5: Yellow Interface (Clip Studio & Auto-Post Engine)
def render_scene_5(progress):
    im = Image.new("RGB", (WIDTH, HEIGHT), (255, 249, 230)) # Warm yellow background
    draw = ImageDraw.Draw(im)
    
    # Camera pans from vertical monitor to 4 colorful auto-clips
    if progress < 0.45:
        zoom = 1.0 + (progress / 0.45) * 0.32
        cx, cy = 600, 480
    elif progress < 0.85:
        zoom = 1.30
        cx, cy = 700, 720
    else:
        zoom = 1.30 - ((progress - 0.85) / 0.15) * 0.30
        cx, cy = 960, 540
        
    # Header
    draw_app_header(draw, "studio", (245, 158, 11), "YELLOW INTERFACE", "Short-Form Clip Studio & Auto-Post", (254, 240, 138), (69, 26, 3))
    logo_thumb = logo_raw.resize((36, 36), Image.Resampling.LANCZOS)
    im.paste(logo_thumb, (222, 18), logo_thumb)
    
    # Top Workstation Bar
    top_w, top_h = 1600, 65
    draw_card(draw, (160, 95, 160 + top_w, 95 + top_h), 32, (251, 191, 36))
    draw.text((200, 115), "CONNECTED VIDEO:", font=get_font(12, bold=True), fill=(69, 26, 3))
    draw_card(draw, (360, 107, 760, 147), 20, (17, 19, 21))
    draw.text((380, 118), "Did the AI bubble just pop? (05:25)", font=get_font(12, bold=True), fill=(255, 255, 255))
    
    draw_card(draw, (1160, 107, 1420, 147), 20, (17, 19, 21))
    draw.text((1185, 118), "* Auto-Generate AI Clips", font=get_font(12, bold=True), fill=(255, 255, 255))
    draw_card(draw, (1440, 107, 1720, 147), 20, (217, 119, 6))
    draw.text((1475, 118), "Download Clip (MP4)", font=get_font(12, bold=True), fill=(255, 255, 255))
    
    # Left Column: Laptop Studio Monitor Canvas & 4 Auto-Clips
    left_x = 160
    left_y = 180
    left_w = 880
    
    # 1080p Monitor Card
    draw_card(draw, (left_x, left_y, left_x + left_w, left_y + 440), 34, (17, 19, 21))
    # Monitor toolbar
    draw_card(draw, (left_x, left_y, left_x + left_w, left_y + 48), 34, (24, 26, 31))
    # Window traffic light dots
    draw.ellipse((left_x + 24, left_y + 19, left_x + 34, left_y + 29), fill=(239, 68, 68))
    draw.ellipse((left_x + 40, left_y + 19, left_x + 50, left_y + 29), fill=(245, 158, 11))
    draw.ellipse((left_x + 56, left_y + 19, left_x + 66, left_y + 29), fill=(34, 197, 94))
    draw.text((left_x + 80, left_y + 16), "STUDIO WORKSTATION * 1080p CANVAS", font=get_font(10, bold=True), fill=(148, 163, 184))
    
    # Aspect Ratio tabs
    draw_card(draw, (left_x + left_w - 280, left_y + 10, left_x + left_w - 20, left_y + 38), 14, (37, 40, 48))
    draw.text((left_x + left_w - 265, left_y + 15), "16:9", font=get_font(10, bold=True), fill=(148, 163, 184))
    draw_card(draw, (left_x + left_w - 210, left_y + 10, left_x + left_w - 110, left_y + 38), 14, (251, 191, 36))
    draw.text((left_x + left_w - 195, left_y + 15), "9:16 Vertical", font=get_font(10, bold=True), fill=(0, 0, 0))
    draw.text((left_x + left_w - 85, left_y + 15), "1:1", font=get_font(10, bold=True), fill=(148, 163, 184))
    
    # 9:16 Vertical Screen Frame in Center of Monitor
    v_w = 175
    v_h = 310
    v_x = left_x + (left_w - v_w) // 2
    v_y = left_y + 60
    draw_card(draw, (v_x, v_y, v_x + v_w, v_y + v_h), 18, (0, 0, 0), outline=(255, 255, 255, 40), width=1)
    
    # Thumbnail inside vertical cut
    thumb_vert = thumbs[0].resize((v_w, v_h), Image.Resampling.LANCZOS)
    im.paste(thumb_vert, (v_x, v_y))
    
    # Burned Dynamic Subtitle Overlay on video
    draw_card(draw, (v_x + 10, v_y + 180, v_x + v_w - 10, v_y + 245), 10, (0, 0, 0, 190))
    draw.text((v_x + 18, v_y + 192), "Solving real problems", font=get_font(11, bold=True), fill=(251, 191, 36))
    draw.text((v_x + 18, v_y + 215), "beats repetitive tutorials", font=get_font(11, bold=True), fill=(255, 255, 255))
    
    # Scrubber Timeline Deck
    time_y = left_y + 385
    draw.line((left_x + 30, time_y, left_x + left_w - 30, time_y), fill=(50, 54, 65), width=6)
    prog_w = int((left_w - 60) * ((progress * 1.5) % 1.0))
    draw.line((left_x + 30, time_y, left_x + 30 + prog_w, time_y), fill=(251, 191, 36), width=6)
    draw.text((left_x + 30, time_y + 15), "00:14 / 00:34  |  CLIP RANGE: 00:00 -> 00:34", font=get_font(11, bold=True), fill=(255, 255, 255))
    
    # 4 Colorful Bento AI Clip Cards (Below Monitor)
    deck_y = 645
    draw_card(draw, (left_x, deck_y, left_x + left_w, deck_y + 280), 34, (255, 255, 255), outline=(245, 158, 11, 40), width=1)
    draw.text((left_x + 30, deck_y + 18), "AI AUTO-GENERATED CLIPS (4 VIRAL CUTS SLICED)", font=get_font(12, bold=True), fill=(69, 26, 3))
    
    # 4 Cards: Mint, Blue, Coral, Lavender
    clip_defs = [
        ("The 30-Sec Viral Hook", "96", (16, 185, 129), (6, 78, 59)),
        ("Core Breakthrough Principle", "93", (37, 99, 235), (255, 255, 255)),
        ("The Common Trap to Avoid", "89", (255, 107, 74), (255, 255, 255)),
        ("The 3-Step Action Plan", "87", (139, 92, 246), (255, 255, 255))
    ]
    for c_i, (c_title, c_score, c_bg, c_tx) in enumerate(clip_defs):
        c_x = left_x + 25 + c_i * 208
        draw_card(draw, (c_x, deck_y + 55, c_x + 195, deck_y + 255), 24, c_bg)
        # Score pill
        draw_card(draw, (c_x + 15, deck_y + 70, c_x + 105, deck_y + 98), 12, (0, 0, 0, 60))
        draw.text((c_x + 25, deck_y + 76), f"VIRAL: {c_score}", font=get_font(10, bold=True), fill=(255, 255, 255))
        draw.text((c_x + 15, deck_y + 115), c_title, font=get_font(13, bold=True), fill=c_tx)
        draw.text((c_x + 15, deck_y + 185), "34s * Vertical\nAuto-captions burned", font=get_font(10, bold=False), fill=(255, 255, 255, 220))
        
    # Right Column: Subtitle Presets & Automated Auto-Post Engine
    right_x = 1070
    right_w = 690
    draw_card(draw, (right_x, left_y, right_x + right_w, left_y + 745), 34, (255, 255, 255), outline=(245, 158, 11, 40), width=1)
    
    # Subtitle Style presets
    draw.text((right_x + 40, left_y + 30), "SUBTITLE DISPLAY PRESET", font=get_font(12, bold=True), fill=(69, 26, 3))
    draw_card(draw, (right_x + 40, left_y + 60, right_x + 280, left_y + 105), 20, (251, 191, 36))
    draw.text((right_x + 60, left_y + 73), "Clean Bold (Yellow Pop)", font=get_font(12, bold=True), fill=(0, 0, 0))
    draw_card(draw, (right_x + 295, left_y + 60, right_x + 480, left_y + 105), 20, (255, 251, 235), outline=(245, 158, 11, 40))
    draw.text((right_x + 315, left_y + 73), "Minimal White Box", font=get_font(12, bold=True), fill=(69, 26, 3))
    
    # Auto-Post Section
    draw.text((right_x + 40, left_y + 140), "AUTOMATED MULTI-PLATFORM AUTO-POST", font=get_font(12, bold=True), fill=(69, 26, 3))
    draw.text((right_x + 40, left_y + 168), "Render, optimize SEO hashtags, and dispatch across channels:", font=get_font(13, bold=False), fill=(120, 53, 15))
    
    # 5 Platform Checkboxes
    platforms = ["YouTube Shorts (✓)", "Instagram Reels (✓)", "TikTok (✓)", "X Clips (✓)", "LinkedIn Video (✓)"]
    for pi, pname in enumerate(platforms):
        pxy = left_y + 205 + pi * 52
        draw_card(draw, (right_x + 40, pxy, right_x + right_w - 40, pxy + 44), 16, (255, 251, 235), outline=(245, 158, 11, 50))
        draw.ellipse((right_x + 60, pxy + 14, right_x + 76, pxy + 30), fill=(34, 197, 94))
        draw.text((right_x + 90, pxy + 12), pname, font=get_font(13, bold=True), fill=(69, 26, 3))
        
    # Auto-Generated Caption Box
    draw.text((right_x + 40, left_y + 485), "AUTO-GENERATED CAPTION & HASHTAGS", font=get_font(11, bold=True), fill=(69, 26, 3))
    draw_card(draw, (right_x + 40, left_y + 510, right_x + right_w - 40, left_y + 630), 20, (255, 251, 235), outline=(245, 158, 11, 40))
    draw.text((right_x + 55, left_y + 525), "Stop doing this wrong! Here is the truth about AI bubble...\n\nKey insight inside. What's your experience? Drop below!\n\n#creator #shorts #reels #ai #tips", font=get_font(12, bold=False), fill=(69, 26, 3))
    
    # Big Auto-Post Action Button
    draw_card(draw, (right_x + 40, left_y + 655, right_x + right_w - 40, left_y + 715), 30, (17, 19, 21))
    draw.text((right_x + 190, left_y + 673), "Auto-Post to Selected Platforms", font=get_font(15, bold=True), fill=(255, 255, 255))
    
    draw_lower_third(draw, "YELLOW INTERFACE • SHORT-FORM STUDIO | 9:16 VERTICAL CUTS & AUTO-POST", "MODULE 4")
    return apply_camera(im, cx, cy, zoom)

# Scene 6: Blue Interface (Brand Memory)
def render_scene_6(progress):
    im = Image.new("RGB", (WIDTH, HEIGHT), (235, 243, 255)) # Blue background
    draw = ImageDraw.Draw(im)
    
    zoom = 1.0 + math.sin(progress * math.pi) * 0.20
    cx, cy = 960, 520
    
    # Header
    draw_app_header(draw, "brand", (37, 99, 235), "BLUE INTERFACE", "Brand Voice & Creator Memory", (219, 234, 254), (30, 58, 138))
    logo_thumb = logo_raw.resize((36, 36), Image.Resampling.LANCZOS)
    im.paste(logo_thumb, (222, 18), logo_thumb)
    
    # 2 Big Bento Panels
    b_y = 120
    b_w = 780
    b_h = 700
    
    # Panel 1: Royal Electric Blue (Left)
    p1_x = 160
    draw_card(draw, (p1_x, b_y, p1_x + b_w, b_y + b_h), 34, (29, 78, 216))
    draw.text((p1_x + 45, b_y + 40), "Creator Tone & Voice Archetype", font=get_font(22, bold=True), fill=(255, 255, 255))
    draw.text((p1_x + 45, b_y + 75), "Controls AI script generation and viral hook wording", font=get_font(13, bold=False), fill=(219, 234, 254))
    
    draw.text((p1_x + 45, b_y + 130), "PRIMARY VOICE ARCHETYPE", font=get_font(11, bold=True), fill=(219, 234, 254))
    draw_card(draw, (p1_x + 45, b_y + 155, p1_x + b_w - 45, b_y + 215), 20, (255, 255, 255))
    draw.text((p1_x + 70, b_y + 173), "Direct & Practitioner-Focused (Fireship Style)", font=get_font(14, bold=True), fill=(15, 23, 42))
    
    draw.text((p1_x + 45, b_y + 250), "TONE GUIDELINES & CORE RULES", font=get_font(11, bold=True), fill=(219, 234, 254))
    draw_card(draw, (p1_x + 45, b_y + 275, p1_x + b_w - 45, b_y + 420), 20, (255, 255, 255))
    draw.text((p1_x + 70, b_y + 295), "Always emphasize real-world practical utility.\nNo clickbait or hyperbolic claims.\nPrioritize solving concrete developer problems.", font=get_font(13, bold=False), fill=(15, 23, 42))
    
    draw_card(draw, (p1_x + 45, b_y + 610, p1_x + b_w - 45, b_y + 665), 28, (16, 185, 129))
    draw.text((p1_x + 280, b_y + 626), "Save Voice Preferences", font=get_font(15, bold=True), fill=(6, 78, 59))
    
    # Panel 2: Jet Black (Right)
    p2_x = 980
    draw_card(draw, (p2_x, b_y, p2_x + b_w, b_y + b_h), 34, (17, 19, 21))
    draw.text((p2_x + 45, b_y + 40), "Guardrails & Negative Words", font=get_font(22, bold=True), fill=(255, 255, 255))
    draw.text((p2_x + 45, b_y + 75), "Topics and phrasing strictly banned from generated content", font=get_font(13, bold=False), fill=(148, 163, 184))
    
    draw.text((p2_x + 45, b_y + 130), "AVOIDED WORDS & PHRASES", font=get_font(11, bold=True), fill=(148, 163, 184))
    draw_card(draw, (p2_x + 45, b_y + 155, p2_x + b_w - 45, b_y + 215), 20, (30, 32, 37), outline=(255, 255, 255, 30))
    draw.text((p2_x + 70, b_y + 173), "get rich quick, 10x engineer, master this in 24 hours", font=get_font(13, bold=False), fill=(255, 255, 255))
    
    draw.text((p2_x + 45, b_y + 250), "DEFAULT CALL TO ACTION", font=get_font(11, bold=True), fill=(148, 163, 184))
    draw_card(draw, (p2_x + 45, b_y + 275, p2_x + b_w - 45, b_y + 350), 20, (30, 32, 37), outline=(255, 255, 255, 30))
    draw.text((p2_x + 70, b_y + 300), "What's your experience with this? Let me know in the comments.", font=get_font(13, bold=False), fill=(255, 255, 255))
    
    draw_lower_third(draw, "BLUE INTERFACE • BRAND MEMORY | CREATOR VOICE ARCHETYPES & GUARDRAILS", "MODULE 5")
    return apply_camera(im, cx, cy, zoom)

# Scene 7: Outro & Summary
def render_scene_7(progress):
    im = Image.new("RGB", (WIDTH, HEIGHT), (0, 0, 0))
    draw = ImageDraw.Draw(im)
    
    zoom = 1.35 - 0.35 * (progress ** 0.8) # Smooth zoom out to 1.0
    
    # Keypad centered
    kw, kh = 440, int(440 * (1403 / 1121))
    kx = (WIDTH - kw) // 2
    ky = (HEIGHT - kh) // 2 + 30
    kp_resized = keypad_base_raw.resize((kw, kh), Image.Resampling.LANCZOS)
    im.paste(kp_resized, (kx, ky), kp_resized)
    
    # Title & Branding
    logo_thumb = logo_raw.resize((64, 64), Image.Resampling.LANCZOS)
    im.paste(logo_thumb, (WIDTH//2 - 250, 40), logo_thumb)
    
    f_title = get_font(42, bold=True)
    f_sub = get_font(16, bold=False)
    draw.text((WIDTH//2 - 170, 42), "Off Script", font=f_title, fill=(255, 255, 255))
    draw.text((WIDTH//2 - 170, 90), "Creator Memory & Short-Form Studio", font=f_sub, fill=(34, 197, 94))
    
    # Feature Pills
    badges = ["5-Key Macro Hardware", "Real Channel Sync", "Audience Gaps", "9:16 Clip Studio", "Multi-Platform Auto-Post"]
    for bi, bname in enumerate(badges):
        bx = 220 + bi * 295
        draw_card(draw, (bx, 930, bx + 270, 975), 22, (20, 24, 32), outline=(255, 255, 255, 40), width=1)
        draw.text((bx + 25, 944), bname, font=get_font(12, bold=True), fill=(255, 255, 255))
        
    draw_lower_third(draw, "OFF SCRIPT • MINIMALIST, TACTILE & BUILT FOR CREATORS | LOCALHOST:3333", "READY TO LAUNCH")
    return apply_camera(im, WIDTH//2, HEIGHT//2, zoom)

# Dispatch dictionary
SCENE_FUNCS = [
    render_scene_1,
    render_scene_2,
    render_scene_3,
    render_scene_4,
    render_scene_5,
    render_scene_6,
    render_scene_7
]

# Start FFmpeg process
print("Starting FFmpeg video encoder pipe...")
ffmpeg_cmd = [
    FFMPEG_BIN,
    "-y",
    "-f", "rawvideo",
    "-vcodec", "rawvideo",
    "-s", f"{WIDTH}x{HEIGHT}",
    "-pix_fmt", "rgb24",
    "-r", str(FPS),
    "-i", "-",                     # Video from stdin
    "-i", CONCAT_AUDIO,           # Audio from file
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-crf", "18",
    "-pix_fmt", "yuv420p",
    "-c:a", "aac",
    "-b:a", "192k",
    "-shortest",
    OUTPUT_VIDEO
]

proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE)

current_frame = 0
for scene_idx, (dur, render_fn) in enumerate(zip(durations, SCENE_FUNCS)):
    n_frames = int(dur * FPS)
    print(f"Rendering Scene {scene_idx + 1} ({n_frames} frames)...")
    for f in range(n_frames):
        prog = f / float(max(1, n_frames - 1))
        frame_img = render_fn(prog)
        proc.stdin.write(frame_img.tobytes())
        current_frame += 1

proc.stdin.close()
proc.wait()

print(f"Video created successfully: {OUTPUT_VIDEO}")
file_size_mb = os.path.getsize(OUTPUT_VIDEO) / (1024 * 1024)
print(f"File size: {file_size_mb:.2f} MB")
