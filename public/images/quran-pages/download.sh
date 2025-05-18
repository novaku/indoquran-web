for i in $(seq -f "%03g" 1 604); do
  wget -q -O "page${i}.png" "https://raw.githubusercontent.com/GovarJabbar/Quran-PNG/refs/heads/master/${i}.png"
  echo "Downloaded page${i}.png"
done

