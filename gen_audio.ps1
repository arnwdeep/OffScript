Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
  $synth.SelectVoice('Microsoft Zira Desktop')
} catch {}
$synth.Rate = 0

$scenes = @(
  @{ file='scene1_intro.wav'; text='Welcome to Off Script, the modern creator memory and short-form video studio. At the heart of Off Script is an interactive five-key macro interface that turns your entire video library into viral vertical clips with zero friction.' },
  @{ file='scene2_connect.wav'; text='Clicking the first white button takes us into the White Interface. With a clean white canvas and vibrant bento cards, creators can paste any video link, or connect an entire channel by ID, like Fireship. Notice the colorful bento layout, with zero glow and clean vector icons. Returning to the keyboard is always one click away.' },
  @{ file='scene3_library.wav'; text='Pressing the peach button opens your Published Videos Library. Twelve actual videos from Fireship are instantly loaded with live thumbnails, durations, and view counts. Clicking any video streams it in the player with indexed chapters and searchable memory segments.' },
  @{ file='scene4_gaps.wav'; text='The purple button opens Audience Intelligence and Content Gaps. Off Script calculates opportunity scores by comparing viewer comments against your published videos, identifying untapped topics your audience is actively asking for.' },
  @{ file='scene5_studio.wav'; text='The yellow button launches the Short-Form Clip Studio. Pick any video from your connected channel, and our AI auto-clip engine instantly cuts four viral vertical highlights with dynamic burned subtitles. With one click, auto-post directly to YouTube Shorts, Instagram Reels, and TikTok.' },
  @{ file='scene6_brand.wav'; text='Finally, the blue button accesses Brand Memory. Define your tone archetype, guidelines, and avoided terms so every generated clip matches your authentic creator voice.' },
  @{ file='scene7_outro.wav'; text='Off Script. Minimalist, tactile, and built for modern creators. Connect your accounts, index your library, and dominate short-form video today.' }
)

foreach ($item in $scenes) {
  $synth.SetOutputToWaveFile($item.file)
  $synth.Speak($item.text)
  Write-Host "Generated $($item.file)"
}
$synth.Dispose()
