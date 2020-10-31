# *.js
npx babel src --ignore "src/__tests__/*" --out-dir out
# *.json
cp src/*.json out