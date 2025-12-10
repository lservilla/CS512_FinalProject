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
    video_url_1  = url_for("static", filename="vids/Floor.mp4")
    video_url_2 = url_for("static", filename="vids/Wall.mp4")  # second video for future use maybe
    video_url_3 = url_for("static", filename="vids/Topartwork.mp4")
    cache_bust = str(time.time_ns())
    return render_template(
        "clawMachine.html",
        video_url_1=video_url_1,
        video_url_2=video_url_2,
        video_url_3=video_url_3,
        cache_bust=cache_bust
    )

@app.route("/skeeBall")
def skeeBall():
    video_url_1  = url_for("static", filename="vids/GlowGhost.mp4")
    video_url_2 = url_for("static", filename="vids/Wall.mp4")  # second video for future use maybe
    cache_bust = str(time.time_ns())
    return render_template(
        "skeeBall.html",
        video_url_1=video_url_1,
        video_url_2=video_url_2,
        cache_bust=cache_bust
    )

@app.route("/pacMan")
def pacMan():
    return render_template(
        "pacMan.html"
    )

@app.route("/pacMan3D")
def pacMan3D():
    return render_template(
        "pacMan3D.html"
    )

if __name__ == "__main__":
    app.run(debug=True)
