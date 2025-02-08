import os
import discord
import openai
from discord.ext import commands
from langdetect import detect  # pip install langdetect が必要

# 環境変数からAPIキーを取得
openai.api_key = os.environ.get("OPENAI_API_KEY")
DISCORD_TOKEN = os.environ.get("DISCORD_TOKEN")

# DiscordのIntents設定（メッセージ監視のため）
intents = discord.Intents.default()
intents.messages = True

# Botの初期化（プレフィックスは任意です）
bot = commands.Bot(command_prefix="!", intents=intents)

# 各チャンネルのIDと対応する言語コードのマッピング
# ※ここでは例としてIDを記載しています。実際のIDに置き換えてください。
channel_language = {
    123456789012345678: "en",  # 英語チャンネルのID
    234567890123456789: "ja",  # 日本語チャンネルのID
    345678901234567890: "id",  # インドネシア語チャンネルのID
}

# 言語コードから、翻訳時に使う「〇〇語」という名称への変換用マッピング
language_names = {
    "en": "英語",
    "ja": "日本語",
    "id": "インドネシア語",
}

@bot.event
async def on_message(message):
    # Bot自身のメッセージは無視
    if message.author.bot:
        return

    # 対象チャンネルでなければ無視（ここでは channel_language に含まれるチャンネルのみ監視）
    if message.channel.id not in channel_language:
        return

    # チャンネルに設定されている通常の言語
    designated_language = channel_language.get(message.channel.id)

    # まずは投稿内容の言語を自動判定
    try:
        detected_language = detect(message.content)
    except Exception as e:
        print("言語検出エラー:", e)
        detected_language = designated_language  # エラー時はチャンネル設定を採用

    source_language = detected_language  # 投稿の実際の言語

    # 全チャンネルに対して、現在のチャンネル以外に翻訳を送信する
    for channel_id, target_lang in channel_language.items():
        if channel_id == message.channel.id:
            continue  # 同じチャンネルには送信しない

        # 翻訳先の言語名称（例: 英語→「英語」）
        target_language_name = language_names.get(target_lang, target_lang)

        # 翻訳用プロンプトを作成
        prompt = (
            f"以下の文章を{target_language_name}に翻訳してください。"
            "ニュアンスをできるだけ維持し、シンプルな表現にしてください。\n\n"
            f"原文: {message.content}"
        )

        # OpenAI APIを呼び出して翻訳（エンジンやパラメータは適宜調整してください）
        try:
            response = openai.Completion.create(
                engine="text-davinci-003",
                prompt=prompt,
                max_tokens=200,
                temperature=0.3,
            )
            translation = response.choices[0].text.strip()
        except Exception as e:
            translation = f"翻訳エラー: {e}"

        # 対象のチャンネルオブジェクトを取得して、ユーザー名とともに訳文を送信
        target_channel = bot.get_channel(channel_id)
        if target_channel:
            await target_channel.send(f"{message.author.display_name}: {translation}")

    # 他のコマンドがあれば処理できるようにする
    await bot.process_commands(message)

# Botを起動
bot.run(DISCORD_TOKEN)
