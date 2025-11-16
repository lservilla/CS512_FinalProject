from flask import Flask, render_template, url_for
import time

app = Flask(__name__)
app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0 

@app.route("/")
def home():
    return render_template(
        "home.html"
    )

@app.route("/clawMachine")
def clawMachine():
    video_url  = url_for("static", filename="vids/GlowGhost.mp4")
    video_url2 = url_for("static", filename="vids/GlowGhost.mp4")  # second video for future use maybe
    cache_bust = str(time.time_ns())
    return render_template(
        "clawMachine.html",
        video_url=video_url,
        video_url2=video_url2,
        cache_bust=cache_bust
    )

@app.route("/skeeBall")
def skeeBall():
    video_url  = url_for("static", filename="vids/GlowGhost.mp4")
    video_url2 = url_for("static", filename="vids/GlowGhost.mp4")  # second video for future use maybe
    cache_bust = str(time.time_ns())
    return render_template(
        "skeeBall.html",
        video_url=video_url,
        video_url2=video_url2,
        cache_bust=cache_bust
    )

@app.route("/newGame")
def newGame():
    return render_template(
        "newGame.html"
    )

if __name__ == "__main__":
    app.run(debug=True)
