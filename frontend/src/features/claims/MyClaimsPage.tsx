export default function MyClaimsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Meus resgates</h1>
      <p className="text-gray-400 text-sm mb-8">
        Jogos e loots que já resgataste ficam guardados aqui.
      </p>

      <div className="bg-card border border-gray-700 rounded-xl p-10 text-center">
        <p className="text-gray-500 text-sm">Ainda não resgataste nenhum jogo.</p>
      </div>
    </div>
  );
}
