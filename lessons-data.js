// Sou Matome N3 — Embedded lesson content
const LESSONS_DATA = {
  weeks: [
    {
      week: 1,
      title: 'Actions on You, For Later & How Things Seem',
      theme: 'Passive · Completion · Appearance · Purpose · Attempts',
      patterns: ['〜れる/られる','〜させてください','〜ておく','〜てしまう','〜ないと/なくちゃ','〜みたいだ','〜らしい','〜っぽい','〜ようにする','〜ようになる','〜ために','〜ように言う/頼む','〜うとする','〜うとしない'],
      article: `
<div class="sl-day-block">
  <div class="sl-day-label">Day 1 — Passive &amp; Permission</div>

  <div class="sl-pattern">
    <div class="sl-pattern-name">〜れる / 〜られる <span class="sl-tag">passive</span></div>
    <div class="sl-pattern-meaning">The subject <em>receives</em> an action from someone else.</div>
    <div class="sl-formation">
      G1 (u-verbs): final u → a + れる &nbsp;|&nbsp; 書く → 書<strong>かれる</strong><br>
      G2 (ru-verbs): drop る + られる &nbsp;|&nbsp; 食べる → 食べ<strong>られる</strong><br>
      Irregular: する → <strong>される</strong> &nbsp;|&nbsp; くる → <strong>こられる</strong>
    </div>
    <div class="sl-examples">
      <div class="sl-ex"><span class="sl-jp">財布を盗まれた。</span><span class="sl-en">My wallet was stolen (I'm upset about it).</span></div>
      <div class="sl-ex"><span class="sl-jp">雨に降られて、びしょぬれになった。</span><span class="sl-en">I got rained on and was soaked.</span></div>
      <div class="sl-ex"><span class="sl-jp">この小説は100年前に書かれた。</span><span class="sl-en">This novel was written 100 years ago.</span></div>
    </div>
    <div class="sl-tip">⚠️ For G2 verbs, passive られる looks identical to potential られる. The に particle signals passive: <em>だれかに</em>食べられた = was eaten by someone.</div>
    <div class="sl-tip sl-tip-real">💬 Real life: Use this when something bad happened to you — 傘を取られた, 彼女に浮気された, 上司に叱られた. The suffering tone is built in.</div>
  </div>

  <div class="sl-pattern">
    <div class="sl-pattern-name">〜させてください <span class="sl-tag">permission</span></div>
    <div class="sl-pattern-meaning">Please let me do X — humble request for permission.</div>
    <div class="sl-examples">
      <div class="sl-ex"><span class="sl-jp">一つ質問させてください。</span><span class="sl-en">Please allow me to ask one question.</span></div>
      <div class="sl-ex"><span class="sl-jp">先に帰らせてください。</span><span class="sl-en">Please let me leave early.</span></div>
    </div>
    <div class="sl-tip sl-tip-real">💬 Real life: More formal/humble than てもいいですか. Use at work, with seniors, in formal requests. Shows you respect that the other person has authority over the situation.</div>
  </div>
</div>

<div class="sl-day-block">
  <div class="sl-day-label">Day 2 — Completion &amp; Obligation</div>

  <div class="sl-pattern">
    <div class="sl-pattern-name">〜ておく / とく <span class="sl-tag">preparation</span></div>
    <div class="sl-pattern-meaning">Do something in advance for a future purpose. Leave something in a state intentionally.</div>
    <div class="sl-examples">
      <div class="sl-ex"><span class="sl-jp">旅行の前にホテルを予約しておいた。</span><span class="sl-en">I reserved the hotel in advance (before the trip).</span></div>
      <div class="sl-ex"><span class="sl-jp">後で読むから、そのメール消さないでおいて。</span><span class="sl-en">Leave that email (don't delete it) — I'll read it later.</span></div>
    </div>
    <div class="sl-tip sl-tip-real">💬 Real life: 急いでやっとけ (casual: get it done now so it's ready). Always implies a reason to prepare — if there's no future purpose, use just て-form.</div>
  </div>

  <div class="sl-pattern">
    <div class="sl-pattern-name">〜てしまう / ちゃう <span class="sl-tag">completion / regret</span></div>
    <div class="sl-pattern-meaning">Meaning 1: Completely done (and I regret it / didn't mean to). &nbsp; Meaning 2: Finished thoroughly.</div>
    <div class="sl-examples">
      <div class="sl-ex"><span class="sl-jp">大事なメールを消してしまった。</span><span class="sl-en">I accidentally deleted an important email. (regret)</span></div>
      <div class="sl-ex"><span class="sl-jp">一時間で本を読んでしまった。</span><span class="sl-en">I finished the book in one hour. (impressive completion)</span></div>
      <div class="sl-ex"><span class="sl-jp">食べちゃった！</span><span class="sl-en">I ate it all! (casual — oops or wow)</span></div>
    </div>
    <div class="sl-tip">Context decides the nuance. Bad outcome = regret. Neutral/positive = completion.</div>
  </div>

  <div class="sl-pattern">
    <div class="sl-pattern-name">〜ないと / 〜なくちゃ <span class="sl-tag">casual obligation</span></div>
    <div class="sl-pattern-meaning">Must do / have to (casual spoken). Full form: 〜ないといけない / 〜なくてはいけない.</div>
    <div class="sl-examples">
      <div class="sl-ex"><span class="sl-jp">早く起きないと。</span><span class="sl-en">I have to wake up early.</span></div>
      <div class="sl-ex"><span class="sl-jp">宿題やらなくちゃ。</span><span class="sl-en">I've gotta do my homework.</span></div>
    </div>
    <div class="sl-tip">⚠️ Casual only. In formal/written Japanese use 〜なければなりません.</div>
  </div>
</div>

<div class="sl-day-block">
  <div class="sl-day-label">Day 3 — Appearance &amp; Inference</div>
  <div class="sl-pattern">
    <div class="sl-pattern-name">〜みたいだ / 〜らしい / 〜っぽい <span class="sl-tag">comparison</span></div>
    <div class="sl-pattern-meaning">Three ways to say "seems like" — each with a different source of inference.</div>
    <div class="sl-compare-mini">
      <div class="sl-compare-row"><span class="sl-compare-pat">みたいだ</span><span class="sl-compare-src">Your direct observation right now (informal)</span></div>
      <div class="sl-compare-row"><span class="sl-compare-pat">らしい</span><span class="sl-compare-src">Hearsay <em>or</em> "typical of" (neutral/formal)</span></div>
      <div class="sl-compare-row"><span class="sl-compare-pat">っぽい</span><span class="sl-compare-src">Vague resemblance / tendency (casual, often negative)</span></div>
    </div>
    <div class="sl-tip sl-tip-real">💬 See the Compare tab for the full side-by-side breakdown — this trio is one of the most tested distinctions in N3.</div>
  </div>
</div>

<div class="sl-day-block">
  <div class="sl-day-label">Day 4 — Effort, Change &amp; Purpose</div>

  <div class="sl-pattern">
    <div class="sl-pattern-name">〜ようにする <span class="sl-tag">conscious effort</span></div>
    <div class="sl-pattern-meaning">Make an ongoing effort to do (or not do) something. You are actively trying — it's not automatic.</div>
    <div class="sl-examples">
      <div class="sl-ex"><span class="sl-jp">毎日運動するようにしている。</span><span class="sl-en">I make it a point to exercise every day.</span></div>
      <div class="sl-ex"><span class="sl-jp">遅刻しないようにしてください。</span><span class="sl-en">Please make sure not to be late.</span></div>
    </div>
  </div>

  <div class="sl-pattern">
    <div class="sl-pattern-name">〜ようになる <span class="sl-tag">gradual change</span></div>
    <div class="sl-pattern-meaning">To reach a point where something has become possible or habitual — a gradual change that completed over time.</div>
    <div class="sl-examples">
      <div class="sl-ex"><span class="sl-jp">日本語が話せるようになった。</span><span class="sl-en">I've come to be able to speak Japanese. (couldn't before, can now)</span></div>
      <div class="sl-ex"><span class="sl-jp">毎朝走るようになった。</span><span class="sl-en">I've gotten into the habit of running every morning.</span></div>
    </div>
    <div class="sl-compare-mini" style="margin-top:0.5rem">
      <div class="sl-compare-row"><span class="sl-compare-pat">ようにする</span><span class="sl-compare-src">You consciously try → 食べるようにしている (I make effort to eat)</span></div>
      <div class="sl-compare-row"><span class="sl-compare-pat">ようになる</span><span class="sl-compare-src">Natural change reached → 食べられるようになった (I came to be able to eat)</span></div>
    </div>
  </div>

  <div class="sl-pattern">
    <div class="sl-pattern-name">〜ために <span class="sl-tag">purpose / cause</span></div>
    <div class="sl-pattern-meaning">Purpose: "in order to". &nbsp; Cause: "because of / due to".</div>
    <div class="sl-examples">
      <div class="sl-ex"><span class="sl-jp">日本語を上達させるために、毎日アプリを使う。</span><span class="sl-en">In order to improve my Japanese, I use an app every day.</span></div>
      <div class="sl-ex"><span class="sl-jp">台風のために、試合が中止になった。</span><span class="sl-en">Because of the typhoon, the game was cancelled.</span></div>
    </div>
    <div class="sl-tip">⚠️ Purpose ために needs a volitional verb (an action you choose). ✗ 病気になるために — for uncontrollable outcomes, use 〜ように instead.</div>
  </div>
</div>

<div class="sl-day-block">
  <div class="sl-day-label">Day 5 — Indirect Requests &amp; Hopes</div>

  <div class="sl-pattern">
    <div class="sl-pattern-name">〜ように（言う / 頼む / 祈る） <span class="sl-tag">indirect speech</span></div>
    <div class="sl-pattern-meaning">Report an instruction, request, or hope — not quoting exact words, but conveying meaning.</div>
    <div class="sl-examples">
      <div class="sl-ex"><span class="sl-jp">先生は静かにするように言った。</span><span class="sl-en">The teacher told them to be quiet.</span></div>
      <div class="sl-ex"><span class="sl-jp">彼に早く来るように頼んだ。</span><span class="sl-en">I asked him to come early.</span></div>
      <div class="sl-ex"><span class="sl-jp">試験に合格できるように祈っています。</span><span class="sl-en">I'm praying that I'll pass the exam.</span></div>
    </div>
    <div class="sl-tip sl-tip-real">💬 vs 〜と言った (direct quote): Use ように when reporting what was requested/hoped — not quoting word for word.</div>
  </div>
</div>

<div class="sl-day-block">
  <div class="sl-day-label">Day 6 — Attempting &amp; Refusing</div>

  <div class="sl-pattern">
    <div class="sl-pattern-name">〜うとする / ようとする <span class="sl-tag">attempt</span></div>
    <div class="sl-pattern-meaning">Try to do; be on the verge of doing — at the moment of attempting, often interrupted.</div>
    <div class="sl-examples">
      <div class="sl-ex"><span class="sl-jp">立ち上がろうとしたとき、電話が鳴った。</span><span class="sl-en">Just as I was about to stand up, the phone rang.</span></div>
      <div class="sl-ex"><span class="sl-jp">何度も電話しようとしたけど、できなかった。</span><span class="sl-en">I tried to call many times but couldn't.</span></div>
    </div>
  </div>

  <div class="sl-pattern">
    <div class="sl-pattern-name">〜うとしない / ようとしない <span class="sl-tag">refusal</span></div>
    <div class="sl-pattern-meaning">Refuses to; won't even try — expresses stubborn reluctance. Critical/frustrated tone from the speaker.</div>
    <div class="sl-examples">
      <div class="sl-ex"><span class="sl-jp">彼は謝ろうとしない。</span><span class="sl-en">He won't apologize. (refuses to even try)</span></div>
      <div class="sl-ex"><span class="sl-jp">子供は野菜を食べようとしない。</span><span class="sl-en">The child refuses to eat vegetables.</span></div>
    </div>
    <div class="sl-tip">⚠️ This is NOT just a negative of うとする. It requires a subject with free will who is choosing not to try. ✗ 雨がやもうとしない (rain can't refuse).</div>
  </div>
</div>
      `,

      compare: `
<div class="sl-compare-header">
  <div class="sl-compare-title">みたいだ vs らしい vs っぽい</div>
  <div class="sl-compare-subtitle">The "Seems Like" Trio — most tested distinction in Week 1</div>
</div>

<div class="sl-compare-summary">
  <div class="sl-cs-row header">
    <span>Pattern</span><span>Source</span><span>Register</span>
  </div>
  <div class="sl-cs-row">
    <span class="sl-pat-badge">みたいだ</span>
    <span>Your own eyes/senses right now</span>
    <span class="sl-reg casual">Casual</span>
  </div>
  <div class="sl-cs-row">
    <span class="sl-pat-badge">らしい</span>
    <span>Hearsay <em>or</em> "typical of"</span>
    <span class="sl-reg neutral">Neutral</span>
  </div>
  <div class="sl-cs-row">
    <span class="sl-pat-badge">っぽい</span>
    <span>Vague resemblance / tendency</span>
    <span class="sl-reg casual">Casual</span>
  </div>
</div>

<div class="sl-pattern">
  <div class="sl-pattern-name">〜みたいだ</div>
  <div class="sl-pattern-meaning">You are <strong>directly observing</strong> or sensing something. You trust your own experience.</div>
  <div class="sl-examples">
    <div class="sl-ex"><span class="sl-jp">彼女、泣いてるみたい。目が赤いよ。</span><span class="sl-en">She seems to be crying — her eyes are red. (I'm looking at her)</span></div>
    <div class="sl-ex"><span class="sl-jp">このケーキ、手作りみたい！</span><span class="sl-en">This cake seems homemade! (I'm tasting it)</span></div>
  </div>
  <div class="sl-tip sl-tip-real">💬 Signal: You're there, experiencing it. Your direct personal conclusion.</div>
</div>

<div class="sl-pattern">
  <div class="sl-pattern-name">〜らしい &nbsp;<small>(two meanings!)</small></div>
  <div class="sl-pattern-meaning"><strong>Meaning 1:</strong> Hearsay — info came from outside (news, rumor, what someone told you).<br><strong>Meaning 2:</strong> Typical of / quintessentially X.</div>
  <div class="sl-examples">
    <div class="sl-ex"><span class="sl-jp">田中さん、来週転職するらしいよ。</span><span class="sl-en">I heard Tanaka is changing jobs next week. (someone told me)</span></div>
    <div class="sl-ex"><span class="sl-jp">彼女って本当に先生らしい先生だよね。</span><span class="sl-en">She's truly a quintessential teacher. (so typical of what a teacher should be)</span></div>
    <div class="sl-ex"><span class="sl-jp">春らしい天気になってきた。</span><span class="sl-en">It's started to feel like proper spring weather.</span></div>
  </div>
  <div class="sl-tip">⚠️ Two very different uses! If someone/something is being described as "typical of themselves" = Meaning 2. If info came from outside = Meaning 1.</div>
</div>

<div class="sl-pattern">
  <div class="sl-pattern-name">〜っぽい</div>
  <div class="sl-pattern-meaning">Vague resemblance or a tendency someone/something has. Often slightly negative. Very casual.</div>
  <div class="sl-examples">
    <div class="sl-ex"><span class="sl-jp">このカバン、安っぽいデザインだな。</span><span class="sl-en">This bag has a cheap-looking design.</span></div>
    <div class="sl-ex"><span class="sl-jp">彼って怒っぽいよね。すぐキレる。</span><span class="sl-en">He tends to get angry easily, doesn't he.</span></div>
    <div class="sl-ex"><span class="sl-jp">外が白っぽい。霧かな？</span><span class="sl-en">It's kind of white outside. Maybe fog?</span></div>
  </div>
  <div class="sl-tip">Attached directly to noun/adj/verb stem. Describes a tendency, not a one-time observation.</div>
</div>

<div class="sl-day-block" style="margin-top:1.5rem">
  <div class="sl-day-label">Same situation — three patterns</div>
  <p style="font-size:0.85rem;color:var(--text-2);margin-bottom:0.75rem">You suspect your friend is sick:</p>
  <div class="sl-examples">
    <div class="sl-ex"><span class="sl-jp">彼は病気みたいだ。顔色が悪い。</span><span class="sl-en">I'm looking at him — he looks pale. (direct)</span></div>
    <div class="sl-ex"><span class="sl-jp">彼は病気らしい。今日会社を休んだって。</span><span class="sl-en">I heard he called in sick. (hearsay)</span></div>
    <div class="sl-ex"><span class="sl-jp">彼って病気っぽいよね、最近。</span><span class="sl-en">He always seems kind of sickly lately. (tendency)</span></div>
  </div>
</div>

<div class="sl-day-block">
  <div class="sl-day-label">Common mistakes</div>
  <div class="sl-tip">1. Using みたいだ when info was from hearsay → should be らしい</div>
  <div class="sl-tip">2. Using っぽい in formal writing or about superiors → too casual</div>
  <div class="sl-tip">3. Missing らしい's second meaning (typical) — read context carefully</div>
</div>
      `,

      story: `
<div class="sl-story-title">転職の準備</div>
<div class="sl-story-subtitle">A Career Change — all Week 1 patterns used naturally</div>
<div class="sl-story-hint">Tap any highlighted pattern to see which grammar point it is.</div>

<div class="sl-story-body">
<p>田中けんじは今の仕事をやめて、新しい会社に転職<span class="sl-hl" data-tip="〜うとしている: in the process of trying">しようとしている</span>。でも、なかなか決断できないでいた。</p>

<p>「けんじ、最近元気ないね。どうしたの？」と、友達のさくらが言った。</p>

<p>「実は、転職を考えてるんだけど、なかなか動けなくて。」</p>

<p>「転職したいなら、早めに動か<span class="sl-hl" data-tip="〜ないと: casual 'you have to'">ないと</span>。」さくらはそう言いながら、温かいコーヒーを出してくれた。</p>

<p>「うん、わかってる。でも、今の会社に長くいたから、なんか怖くてさ。」</p>

<p>「けんじって、慎重<span class="sl-hl" data-tip="〜っぽい: vague tendency / characteristic">っぽい</span>よね。でも、この前の話、本当によさそうだったよ？友達に聞いたんだけど、その会社、雰囲気がいい<span class="sl-hl" data-tip="〜らしい: hearsay — I heard it from someone">らしい</span>よ。」</p>

<p>「そうなんだよ。求人票を見てたら、自分がやりたかった仕事<span class="sl-hl" data-tip="〜みたいだ: personal observation — it looked like to me">みたいだった</span>し。でも、面接に<span class="sl-hl" data-tip="〜れる passive: adversative — 'if I get rejected (to my misfortune)'">落とされたら</span>どうしようって思って…。」</p>

<p>「何もしないままでいるより、挑戦する<span class="sl-hl" data-tip="〜ようにする: conscious effort — make it a point to try">ようにした</span>ほうがいいよ。私も去年、勇気を出して転職してから、仕事が楽しめる<span class="sl-hl" data-tip="〜ようになる: gradual change — came to be able to enjoy">ようになった</span>し。」</p>

<p>さくらの言葉を聞いて、けんじは少し前向きになった。</p>

<p>その夜、けんじは履歴書を書い<span class="sl-hl" data-tip="〜ておく: preparation in advance for a future purpose">ておいて</span>、翌朝、メールを送ろう<span class="sl-hl" data-tip="〜うとする: at the moment of attempting">とした</span>。でも、送信ボタンを押そうとした瞬間、手が止まっ<span class="sl-hl" data-tip="〜てしまう: unintended completion — regret nuance">てしまった</span>。</p>

<p>「あーもう、こんなに緊張するとは思わなかった。でも、送ら<span class="sl-hl" data-tip="〜ないと: casual obligation">ないと</span>！」</p>

<p>けんじは目を閉じて、ゆっくり息を吸った。そして、ボタンを押した。</p>

<p>数日後、会社から「面接に来てください」とのメールが届いた。けんじはさくらに電話した。</p>

<p>「さくら、面接に<span class="sl-hl" data-tip="〜れる passive: neutral passive — 'was called/invited'">呼ばれた</span>！」</p>

<p>「よかった！面接、緊張しない<span class="sl-hl" data-tip="〜ようにする: make effort not to (negative form)">ようにね</span>。あと、自分<span class="sl-hl" data-tip="〜らしい meaning 2: typical of yourself / authentic">らしい</span>答えを言えるように練習し<span class="sl-hl" data-tip="〜ておく: prepare in advance">ておく</span>といいよ。」</p>

<p>「うん。本当にありがとう。さくらに話を聞いてもらえなかったら、メールを送ろうとしなかったかもしれない。」</p>

<p>「応援してるよ。絶対うまくいく<span class="sl-hl" data-tip="〜ように祈る: indirect hope / prayer for a result">ように祈ってる</span>！」</p>
</div>
      `,

      quiz: [
        {
          q: '明日の会議のために、資料を___おいた。',
          ctx: 'You prepared documents the night before a meeting.',
          options: ['作って','作る','作り','作った'],
          correct: 0,
          explanation: '〜ておく = do in advance. て-form + おく → 作って + おいた. The preparation nuance (doing now for a future purpose) requires the て-form connection.'
        },
        {
          q: '彼女はどんなに頼んでも、謝ろう___。',
          ctx: 'No matter how much you ask, she simply won\'t apologize.',
          options: ['としない','とする','にする','になる'],
          correct: 0,
          explanation: '〜うとしない = refuses to / won\'t even try. Expresses stubborn refusal with a critical/frustrated tone from the speaker. とする would mean "she tried to apologize" — the opposite meaning.'
        },
        {
          q: '毎晩ポートフォリオを___ようにしている。',
          ctx: 'You make a conscious effort to update your portfolio every night.',
          options: ['更新して','更新する','更新した','更新しない'],
          correct: 1,
          explanation: '〜ようにする = conscious effort. The verb before ように must be in plain (dictionary) form: 更新する + ようにしている. て-form (更新して) would create a different structure.'
        },
        {
          q: 'あの新しいカフェ、すごく人気___よ。毎朝行列ができてるって。',
          ctx: 'Someone told you about the café\'s popularity — you didn\'t see it yourself.',
          options: ['みたいだ','らしい','っぽい','ようだ'],
          correct: 1,
          explanation: '〜らしい = hearsay. The clue is って (I heard that...) — information came from someone else, not your direct observation. みたいだ would mean you saw it yourself.'
        },
        {
          q: '大事なファイルを間違えて消し___。バックアップもない…',
          ctx: 'You accidentally deleted an important file and are devastated.',
          options: ['ておいた','てしまった','ようとした','ておく'],
          correct: 1,
          explanation: '〜てしまう = unintended completion with regret. 間違えて (accidentally) + てしまった = I accidentally did it completely (regret). ておいた would mean "I deleted it on purpose in advance."'
        },
        {
          q: '日本語で自然に話せる___になりたい。',
          ctx: 'You want to reach a level where speaking Japanese naturally happens automatically.',
          options: ['ようにする','ようになる','ために','ように'],
          correct: 1,
          explanation: '〜ようになる = gradual change / reaching a new state. You want to ARRIVE at an ability, not just try for it. ようにする = conscious effort (already trying). ようになる = the destination state you want to reach.'
        },
        {
          q: 'この映画、内容が子供___と思わない？',
          ctx: 'The movie\'s content vaguely resembles something childish — a casual observation.',
          options: ['みたいな','らしい','っぽい','のようだ'],
          correct: 2,
          explanation: '〜っぽい = vague resemblance / tendency (casual). Attaches directly to 子供 to mean "childish/childlike" as a vague characteristic. みたいな = more specific direct observation. っぽい is perfect for casual "kind of -ish" judgments.'
        },
        {
          q: '先生は生徒たちに「携帯をしまう」___言った。',
          ctx: 'Reporting what the teacher instructed — not quoting exact words.',
          options: ['と','ように','ために','ようにして'],
          correct: 1,
          explanation: '〜ように言う = indirect instruction reporting. と says the teacher quoted those exact words. ように says the teacher conveyed the message/instruction. Since we\'re reporting meaning (not exact speech), ように is correct.'
        },
        {
          q: '早く行か___！もう電車が来るよ！',
          ctx: 'Urgently telling someone they need to hurry up.',
          options: ['ないと','なくて','ないで','ないようにしないと'],
          correct: 0,
          explanation: '〜ないと = casual must/have to. 行かないと！= You have to go / You\'d better go! The trailing と with rising intonation is a common casual way to express urgency/obligation in spoken Japanese.'
        },
        {
          q: '彼は日本で3年間住んで、お箸が上手に使える___になった。',
          ctx: 'After 3 years in Japan, a natural ability developed over time.',
          options: ['ようにする','ようになる','ために','ように'],
          correct: 1,
          explanation: '〜ようになる = gradual change that completed. The ability developed naturally over 3 years — nobody forced it. ようにする would mean "he makes it a point to use chopsticks well" (ongoing effort), but the sentence says the change already happened.'
        },
        {
          q: '次の文で〜ために の使い方が間違っているのはどれ？',
          ctx: 'Which sentence uses 〜ために incorrectly?',
          options: [
            '日本語を上手にしゃべるために、毎日練習している。',
            '風邪を引くために、外出を控えています。',
            '彼女を喜ばせるために、サプライズを準備した。',
            '試験に合格するために、毎日勉強している。'
          ],
          correct: 1,
          explanation: '〜ために for purpose requires a VOLITIONAL verb — an action you choose. "風邪を引く" (catching a cold) is not intentional — you can\'t decide to catch a cold. This makes B grammatically strange. For uncontrolled outcomes, use 〜ないように instead.'
        },
        {
          q: '次の文で受け身（passive）の使い方が間違っているのはどれ？',
          ctx: 'Which sentence has an incorrect use of passive voice?',
          options: [
            'この曲は有名なアーティストに作られた。',
            '電車の中で足を踏まれた。',
            '彼女に財布を盗まれた気持ちがした。',
            '私は宿題を先生に出られた。'
          ],
          correct: 3,
          explanation: '宿題を先生に出られた is unnatural. 出す (to hand in/assign) doesn\'t work in this adversative passive construction with this structure. The natural expression would be 先生に宿題を出された (the teacher assigned me homework). Option D has the particles in the wrong order for this verb.'
        },
        {
          q: '「６時に起きられるようになりたい。」What does this sentence mean?',
          ctx: 'Choose the best English translation.',
          options: [
            'I make it a point to wake up at 6am.',
            'I want to reach the point where I can wake up at 6am.',
            'Please let me wake up at 6am.',
            'I have to wake up at 6am.'
          ],
          correct: 1,
          explanation: '〜ようになる = gradual change / reaching a state. Combined with たい (want), it means "I want to get to the point where I\'m able to wake up at 6." This is talking about a future state you want to reach, not a current habit (ようにする) or obligation (ないと).'
        },
        {
          q: '友達の顔色が悪い。今あなたの目の前にいる。「疲れているみたいだ」の代わりに使えないのはどれ？',
          ctx: 'Your friend looks pale and tired. You\'re looking at them right now. Which alternative does NOT fit?',
          options: [
            '疲れているようだ',
            '疲れているらしい',
            '疲れてそうだ',
            '疲れているみたいだな'
          ],
          correct: 1,
          explanation: '〜らしい = hearsay or "typical of." You can\'t use it for direct observation happening right in front of you. らしい would mean you HEARD from someone that they\'re tired — but you\'re watching them yourself. みたいだ / ようだ / そうだ all work for direct visual observation.'
        },
        {
          q: '会議中に上司に：「少し確認させ___。」',
          ctx: 'You want to politely ask your boss if you can check something in a meeting.',
          options: [
            'てください',
            'てもらいます',
            'てもいいですか',
            'てほしいです'
          ],
          correct: 0,
          explanation: '〜させてください = please allow me to (humble request for permission). In a business/formal context with a superior, this is the most appropriate. てもいいですか is more casual and direct. させてください shows humility and deference — key for business Japanese.'
        },
        {
          q: '財布を___、今日は何も買えない。',
          ctx: 'You forgot your wallet and now can\'t buy anything — expressing regret.',
          options: [
            '忘れていて',
            '忘れてしまって',
            '忘れておいて',
            '忘れてみたいで'
          ],
          correct: 1,
          explanation: '〜てしまって = regretful completion (て-form connecting to next clause). 忘れてしまって = having unfortunately forgotten (and as a result...). ていて = neutral ongoing state. ておいて = purposely left behind (opposite meaning). The regret nuance of てしまう fits perfectly here.'
        },
        {
          q: '「山田さんは先月から毎朝ジョギングするようにしているらしい。」— Why is らしい used here?',
          ctx: 'Choose the reason the author used らしい.',
          options: [
            'The speaker can see Yamada jogging right now.',
            'The speaker heard it from someone or read it somewhere.',
            'Yamada looks like the type who would jog.',
            'It\'s a vague resemblance.'
          ],
          correct: 1,
          explanation: '〜らしい = hearsay. The speaker doesn\'t have direct knowledge of Yamada\'s morning habit — they learned it from somewhere (was told, read it, overheard). If they were watching Yamada jog right now, みたいだ or ようだ would be more natural.'
        },
        {
          q: '「走ろうとしたけど、やめてしまったそうだ。」— What does this tell us about Yamada?',
          ctx: 'Interpret the meaning of this sentence.',
          options: [
            'He tried to run and succeeded.',
            'He was about to run but ended up stopping (unintended outcome).',
            'He refuses to run at all.',
            'He ran in advance as preparation.'
          ],
          correct: 1,
          explanation: '走ろうとした = was on the verge of running / attempted to run. やめてしまった = ended up stopping (with slight regret nuance from てしまう). Together: he made the attempt but it didn\'t go through — an interrupted/unintended outcome.'
        },
        {
          q: '「コーチは「雨でも走るようにしてください」と言った。」— What is the coach asking?',
          ctx: 'What does the coach\'s instruction mean?',
          options: [
            'The coach hopes Yamada will change naturally over time.',
            'The coach is telling Yamada to make a conscious effort to run even in rain.',
            'The coach wants Yamada to try running and then stop.',
            'The coach is asking for permission to run.'
          ],
          correct: 1,
          explanation: '〜ようにしてください = please make it a point to / please make a conscious effort to. The coach is giving an ongoing instruction — not a one-time command, but a habit/policy to adopt. This is the key distinction of ようにする: it\'s about sustained conscious effort.'
        },
        {
          q: '「体が健康になるようになるといいのだが…」— What nuance does ようになる add?',
          ctx: 'What does ようになる express in this context?',
          options: [
            'The speaker is working hard to make it happen.',
            'The speaker hopes for a gradual positive change over time.',
            'The speaker is giving Yamada a command.',
            'The speaker heard from someone that Yamada will get healthy.'
          ],
          correct: 1,
          explanation: '〜ようになる = gradual change reaching a new state. Combined with といいのだが (I wish/hope that...), the speaker is hoping that Yamada will eventually arrive at a healthy state — a gradual transformation, not something immediate or forced. This is the "destination" sense of ようになる.'
        }
      ]
    }
  ]
};
